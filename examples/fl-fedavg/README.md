# Virtual Pods configuration and implementation

According to the CEC Middleware implementation, we can define microservices as Virtual Pods. 

- [Structure of `vpods.yml`](#structure-of-vpodsyml)
- [Implementation of a Microservice](#implementation-of-a-microservice)
    - [HTTP Call Handling](#http-call-handling)
    - [Interacting with Other VPods](#interacting-with-other-vpods)
    - [Interacting with VPods in Other User Sessions](#interacting-with-vpods-in-other-user-sessions)
    - [Interacting with the Main Thread of a Web Page](#interacting-with-the-main-thread-of-a-web-page)


## Structure of `vpods.yml`

The `vpods.yml` file is structured to organize multiple sessions, each containing one or more containers. Below is a generic description of the main components within the file.

- **sessions**: A list of sessions. Each session represents a logical grouping of containers.
  - **name**: The name of the session.
  - **limitConnections** (optional): Limits the number of connections to this session.
  - **containers**: A list of microservices within the session.
    - **name**: The name of the microservice.
    - **network**: The network to which the microservice belongs.
    - **image**: The Docker image used for the Virtual Pod.
    - **source**: The path to the source file or bundle executed by the container.
    - **launcher**: The type of launcher used to start the application within the container.
    - **environment**: (optional) A set of environment variables and their values.
    - **reachableVPods**: (optional) A list of other virtual pods that this container can communicate with.
    - **resourcesUrl**: (optional) A URL to additional resources needed by the container.

## Implementation of a Microservice

To implement a microservice, you can use JavaScript or a JavaScript module that is launched when the VPod starts.

### HTTP Call Handling

To receive HTTP calls, the microservice must expose an asynchronous function that returns a promise. Here is a prototype:

```javascript
export const exampleFunc = async (body, params, headers) => {
  // Function implementation
  return new Promise(((resolve, reject) => {
     // resolve, reject promise
  });
}
```

Following a convention, for a RESTful call like `/exampleFunc/arg1/arg2?example=123`:
- `funcName` is the name of the function to be exposed.
- `body` is the body of the HTTP call, if any.
- `arg1`, `arg2` become `params` as well as any query parameters.
- HTTP call headers are received in the `headers` dictionary.

### Interacting with Other VPods

You can make HTTP calls to interact with other VPods, specifying the VPod name as the domain (which should be listed in the `reachableVPods` configuration).

```javascript
fetch('http://vpodName/test', {
  method: 'POST',
  body: JSON.stringify({example: 123}),
  headers: { 'Content-Type': 'application/json' }
});
```

### Interacting with VPods in Other User Sessions

To interact with VPods in other user sessions, specify the header `X-Kleint-Session-Destination`. The session ID can be retrieved from the `getActiveSessions/sessionName` API exposed by the `kleint-gateway` server component.

### Interacting with the Main Thread of a Web Page

To interact with the main thread of a web page, you can make an HTTP call using the following syntax, specifying the callback function during the initialization of the `KConnector` from the Kleint library:

```javascript
fetch('vpod://main/callbackFunc', {
  method: "POST",
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ example: 123 })
});
```
