// Exported functions (TODO)
// 1. start(body: AggregateBody, params: StringParams, headers: StringHeaders): Promise<FetchResponse>
// 2. stop(body: AggregateBody, params: StringParams, headers: StringHeaders): Promise<FetchResponse>
// 3. resetParams(body: AggregateBody, params: StringParams, headers: StringHeaders): Promise<FetchResponse>
// 4. aggregate(body: AggregateBody, params: StringParams, headers: StringHeaders): Promise<FetchResponse>
var isStarted = false;
var stopCondition = false;
var initTimeout;
var trainTimeout;
var roundTimeout;
const X_KLEINT_SESSION_SENDER = "X-Kleint-Session-Sender";
const X_KLEINT_SESSION_DESTINATION = "X-Kleint-Session-Destination";
var fetchHeaders = {
    "Content-Type": "application/json",
    [X_KLEINT_SESSION_DESTINATION]: "",
};
var initTrainBody = {
    round: 0,
    numEpochs: undefined,
    modelWeights: undefined,
};
var startParams;
var initializedSessions = {
    client: [],
    evaluator: [],
};
var totalNumRounds;
var currentRound = 0;
var aggregatedWeights = {};
var resetWeigthts = true;
var aggregationPromises = [];
var aggregationPromisesResolve = {};
var evaluationPromise = null;
var clientCount = 0;
export async function start(body, params, headers) {
    if (isStarted) {
        return { success: true, message: "Aggregator already started!" };
    }
    isStarted = true;
    initFromParams(JSON.parse(body));
    GUILog("Aggregator started!");
    if (checkUndefinedValues(startParams)) {
        return { success: false, message: "Some parameters are undefined!" };
    }
    await startRound();
    return { success: true, message: "Aggregator started!" };
}
export async function pause(body, params, headers) {
    if (!isStarted) {
        return { success: false, message: "Aggregator is not started!" };
    }
    clearTimeout(initTimeout);
    clearTimeout(trainTimeout);
    clearTimeout(roundTimeout);
    initTimeout = null;
    trainTimeout = null;
    roundTimeout = null;
    stopCondition = true;
    return { success: true, message: "Aggregator will be stopped!" };
}
export async function resetParams(body, params, headers) {
    resetWeigthts = true;
    currentRound = 0;
    if (isStarted) {
        stopCondition = true;
    }
    clearTimeout(initTimeout);
    clearTimeout(trainTimeout);
    clearTimeout(roundTimeout);
    initTimeout = null;
    trainTimeout = null;
    roundTimeout = null;
    initializedSessions = { client: [], evaluator: [] };
    return { success: true, message: "Parameters reset!" };
}
export async function aggregate(body, params, headers) {
    let localWeights = body.weights, localLength = body.length, session = getHeader(headers, X_KLEINT_SESSION_SENDER);
    if (!trainTimeout)
        handleTrainTimeout();
    await _aggregate(localWeights, localLength);
    aggregationPromisesResolve[session].resolve(localLength);
    GUILog(`Client ${session} aggregated`);
    return { message: "Aggregated successfully!" };
}
async function _aggregate(localWeights, localLength) {
    let layers = Object.keys(localWeights);
    await lock.lock();
    if (clientCount == aggregationPromises.length - 1) {
        clearTimeout(trainTimeout);
        clearTimeout(roundTimeout);
        trainTimeout = null;
        roundTimeout = null;
    }
    if (clientCount == 0) {
        for (let i = 0; i < layers.length; i++) {
            let layerName = layers[i];
            aggregatedWeights[layerName] = scalarProduct(localWeights[layerName], localLength);
        }
    }
    else {
        for (let i = 0; i < layers.length; i++) {
            let layerName = layers[i];
            aggregatedWeights[layerName] = addArrays(aggregatedWeights[layerName], scalarProduct(localWeights[layerName], localLength));
        }
    }
    clientCount += 1;
    console.log(`[AGGREGATOR] Aggregated client ${clientCount}/${aggregationPromises.length}`);
    lock.unlock();
}
async function initNewSessions(sessions, destination = "client", sync = true) {
    let notInitializedSessions = sessions.filter((x) => !initializedSessions[destination].includes(x)), newSessions = [];
    if (notInitializedSessions.length > 0) {
        newSessions = await initSession(notInitializedSessions, destination, sync);
    }
    let newInitializedSessions = [
        ...initializedSessions[destination],
        ...newSessions,
    ];
    initializedSessions[destination] = sessions.filter((x) => newInitializedSessions.includes(x));
}
async function initSession(sessions, destination = "client", sync = true) {
    let bodyToSend = {
        dataset: startParams.dataset,
        chunkSize: startParams.chunkSize,
        batchSize: startParams.batchSize,
        distribution: startParams.distribution,
        initTimeout: startParams.initTimeout,
        attachGUI: startParams.attachGUI,
    };
    let initClientPromises = [], headers = { ...fetchHeaders }, fetchParams = {
        method: "POST",
        headers,
        body: JSON.stringify(bodyToSend),
    };
    for (let i = 0; i < sessions.length; i++) {
        fetchParams.headers[X_KLEINT_SESSION_DESTINATION] = sessions[i];
        let response = fetch(`http://${destination}/initSession`, fetchParams);
        let promisesWithTimeout = initWithTimeout(response, sessions[i]);
        sync && initClientPromises.push(promisesWithTimeout);
    }
    if (sync) {
        let responsePromises = await Promise.allSettled(initClientPromises);
        let newSessions = [];
        responsePromises.forEach((result) => {
            if (result.status !== "rejected") {
                newSessions.push(result.value);
            }
        });
        GUILog(`Session initialized (${newSessions.length})`);
        return newSessions;
    }
    return sessions;
}
async function getActiveSessions(sessionType = "client") {
    try {
        let response = await fetch("http://kleint-gateway:11355/getActiveSessions/" + sessionType);
        let json = await response.json();
        return json.sessions;
    }
    catch (error) {
        console.error(error);
        return [];
    }
}
async function aggregateRound() {
    let total_clients_lengths = await Promise.all(aggregationPromises), totalLength = total_clients_lengths.reduce((a, b) => a + b, 0), layers = Object.keys(aggregatedWeights), layerName;
    GUILog(`Aggregating round ${currentRound}/${totalNumRounds}!`);
    if (totalLength > 0) {
        for (let i = 0; i < layers.length; i++) {
            layerName = layers[i];
            aggregatedWeights[layerName] = scalarProduct(aggregatedWeights[layerName], 1 / totalLength);
        }
        runEvalStep();
        console.log(`[AGGREGATOR] Communication round ${currentRound}/${totalNumRounds} completed!`);
        GUILog(`Communication round completed!`);
    }
    else {
        console.warn("[AGGREGATOR] No data to aggregate, round will be repeated.");
    }
    if (currentRound <= totalNumRounds) {
        clientCount = 0;
        if (!stopCondition) {
            await startRound();
        }
        else {
            isStarted = false;
            stopCondition = false;
            return "Stopped!";
        }
    }
    else {
        const clients = await getActiveSessions();
        sendParams("client", clients, true);
        isStarted = false;
        console.log("[AGGREGATOR] Finished!");
        await fetch("vpod://main/onTrainEnd");
        return "Finished!";
    }
}
async function startRound(destination = "client", sync = true) {
    resetWeigthts && (aggregatedWeights = {});
    resetWeigthts = false;
    GUILog(`Initializing client sessions for round ${currentRound + 1}/${totalNumRounds}!`);
    const clients = await getActiveSessions();
    await initNewSessions(clients);
    let minParticipants = Math.min(initializedSessions.client.length, startParams.clientNums), numPartecipants = Math.ceil(minParticipants * startParams.fraction);
    if (numPartecipants < startParams.minClientNums) {
        let warnMessage = `There are no enough clients to start the round. Requesting at least ${startParams.minClientNums} clients!`;
        console.warn(`[AGGREGATOR] ${warnMessage}`);
        startParams.attachGUI &&
            logSessions({
                round: currentRound + 1,
                clients: [warnMessage],
                totalClients: initializedSessions.client,
            });
        return setTimeout(() => startRound(destination, sync), startParams.roundTimeout);
    }
    else if (numPartecipants < startParams.clientNums) {
        console.warn("[AGGREGATOR] Your participants are less than the expected number - " +
            minParticipants +
            "/" +
            startParams.clientNums);
    }
    currentRound++;
    console.log(`[AGGREGATOR] Start round ${currentRound}/${totalNumRounds} with ${numPartecipants} clients!`);
    GUILog(`Starting round`);
    let currentRoundClients = pickRandomClients(initializedSessions.client, numPartecipants);
    let excludedRoundClients = initializedSessions.client.filter((x) => !currentRoundClients.includes(x));
    sendParams("client", excludedRoundClients, sync);
    startParams.attachGUI &&
        logSessions({
            round: currentRound,
            clients: currentRoundClients,
            totalClients: initializedSessions.client,
        });
    let fetchResponses = runTrainStep(currentRoundClients, destination);
    aggregateRound();
    handleRoundTimeout();
    sync &&
        checkFetchResponses("Round started correctly!", await Promise.all(fetchResponses));
    GUILog(`Run train requests completed`);
}
function runTrainStep(currentRoundClients, destination = "client") {
    aggregationPromises = [];
    aggregationPromisesResolve = {};
    let newAggregatedParams = Object.keys(aggregatedWeights).length > 0 ? aggregatedWeights : null;
    let bodyToSend = {
        ...initTrainBody,
        round: currentRound,
        modelWeights: newAggregatedParams,
    }, jsonBody = JSON.stringify(bodyToSend), fetchResponses = [], headers = { ...fetchHeaders, ['X-Kleint-Timeout']: `${5000}` }, fetchParams = {
        method: "POST",
        headers,
        body: jsonBody,
    };
    let destinationsIds = currentRoundClients.join(",");
    fetchParams.headers[X_KLEINT_SESSION_DESTINATION] = destinationsIds;
    for (let i = 0; i < currentRoundClients.length; i++) {
        aggregationPromises.push(new Promise((resolve, reject) => {
            aggregationPromisesResolve[currentRoundClients[i]] = {
                resolve: (localLength) => {
                    resolve(localLength);
                    aggregationPromisesResolve[currentRoundClients[i]].done = true;
                },
                reject,
                done: false,
            };
        }));
    }
    fetchResponses.push(fetch(`http://${destination}/runTrain`, fetchParams));
    return fetchResponses;
}
async function sendParams(destination = "client", sessions, sync = false) {
    let clientPromises = [], headers = { ...fetchHeaders }, body = JSON.stringify(aggregatedWeights), fetchParams = {
        method: "POST",
        headers,
        body,
    };
    for (let i = 0; i < sessions.length; i++) {
        try {
            fetchParams.headers[X_KLEINT_SESSION_DESTINATION] = sessions[i];
            let response = fetch(`http://${destination}/setParams`, fetchParams);
            sync && clientPromises.push(response);
            return { message: "Parameters sent asyncronously!", success: true };
        }
        catch (error) {
            console.error(error);
            return { message: JSON.stringify(error), success: false };
        }
    }
    let responses;
    sync && (responses = await Promise.all(clientPromises));
    return await checkFetchResponses("Parameters sent successfully!", responses);
}
async function runEvalStep() {
    let evaluationPromiseResolve;
    await evaluationPromise;
    evaluationPromise = new Promise(async (resolve, reject) => {
        evaluationPromiseResolve = resolve;
    });
    const evaluators = await getActiveSessions("evaluator");
    await initNewSessions(evaluators, "evaluator");
    let newAggregatedParams = Object.keys(aggregatedWeights).length > 0 ? aggregatedWeights : null;
    let bodyToSend = { round: currentRound, modelWeights: newAggregatedParams }, jsonBody = JSON.stringify(bodyToSend), fetchResponses = [], headers = { ...fetchHeaders }, fetchParams = {
        method: "POST",
        headers,
        body: jsonBody,
    };
    for (let i = 0; i < initializedSessions.evaluator.length; i++) {
        fetchParams.headers[X_KLEINT_SESSION_DESTINATION] =
            initializedSessions.evaluator[i];
        fetchResponses.push(fetch(`http://evaluator/runEval`, fetchParams));
    }
    evaluationPromiseResolve();
}
function pickRandomClients(clientSessions, numPartecipants) {
    let randomSessions = [];
    let sessionsCopy = [...clientSessions];
    for (let i = 0; i < numPartecipants; i++) {
        let randomIndex = Math.floor(Math.random() * sessionsCopy.length);
        randomSessions.push(sessionsCopy[randomIndex]);
        sessionsCopy.splice(randomIndex, 1);
    }
    return randomSessions;
}
function handleTrainTimeout() {
    if (!trainTimeout) {
        trainTimeout = setTimeout(() => {
            resolvePendingPromises(aggregationPromisesResolve);
        }, startParams.trainTimeout);
    }
}
function handleRoundTimeout() {
    if (!roundTimeout) {
        roundTimeout = setTimeout(() => {
            resolvePendingPromises(aggregationPromisesResolve);
        }, startParams.roundTimeout);
    }
}
function resolvePendingPromises(promises) {
    for (let key in promises) {
        if (!promises[key].done) {
            promises[key].resolve(0);
            console.log(`[AGGREGATOR] Client ${key} timeout!`);
        }
    }
}
function scalarProduct(array, scalar) {
    let result = [];
    for (let i = 0; i < array.length; i++) {
        result.push(array[i] * scalar);
    }
    return result;
}
function addArrays(array1, array2) {
    let result = [];
    for (let i = 0; i < array1.length; i++) {
        result.push(array1[i] + array2[i]);
    }
    return result;
}
function checkUndefinedValues(obj) {
    console.log(obj);
    let keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        if (obj[keys[i]] === undefined) {
            console.error(keys[i] + " is undefined!");
            return true;
        }
    }
    return false;
}
async function checkFetchResponses(message = "Request sent correctly", responses) {
    for (let i = 0; i < responses.length; i++) {
        if (!responses[i].ok) {
            let body = await responses[i].json(), message = `${responses[i].status} - 
                ${getHeader(responses[i].headers, X_KLEINT_SESSION_SENDER)} - 
                ${body}`;
            return {
                message,
                success: false,
            };
        }
    }
    return { message: message, success: true };
}
function initWithTimeout(promise, session) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(session);
            GUILog(`Client timeout (${session})!`);
        }, startParams.initTimeout);
        promise.then((result) => {
            if (result.ok) {
                clearTimeout(timeoutId);
                resolve(session);
            }
            else {
                throw new Error("Request failed!");
            }
        }, (error) => {
            clearTimeout(timeoutId);
            reject(error);
        });
    });
}
const GUILog = async (message) => {
    if (startParams.attachGUI) {
        fetch("vpod://main/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
        });
    }
};
function getHeader(headers, headerName) {
    for (let key in headers) {
        if (key.toLowerCase() === headerName.toLowerCase()) {
            return headers[key];
        }
    }
    return undefined;
}
class CustomLock {
    constructor() {
        this.isLocked = false;
        this.unlockQueue = [];
    }
    lock() {
        return new Promise((resolve) => {
            if (!this.isLocked) {
                this.isLocked = true;
                resolve();
            }
            else {
                this.unlockQueue.push(resolve);
            }
        });
    }
    unlock() {
        if (this.unlockQueue.length > 0) {
            const resolve = this.unlockQueue.shift();
            if (resolve) {
                resolve();
            }
        }
        else {
            this.isLocked = false;
        }
    }
}
const lock = new CustomLock();
function initFromParams(params) {
    startParams = {
        dataset: params.dataset,
        distribution: params.distribution,
        chunkSize: params.chunkSize,
        batchSize: params.batchSize,
        clientNums: params.clientNums,
        minClientNums: params.minClientNums ?? 1,
        fraction: params.fraction,
        initTimeout: params.initTimeout * 1000,
        trainTimeout: params.trainTimeout * 1000,
        roundTimeout: params.roundTimeout * 1000,
        numEpochs: params.numEpochs,
        numRounds: params.numRounds,
        attachGUI: params.attachGUI || true,
    };
    initTrainBody = { ...initTrainBody, numEpochs: startParams.numEpochs };
    totalNumRounds = startParams.numRounds;
}
async function logSessions(body) {
    fetch("vpod://main/onRoundStart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}
(async () => {
    await fetch("vpod://main/onReady");
    console.log("[AGGREGATOR] Process ready!");
})();
