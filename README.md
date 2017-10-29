# Service Container


A Symfony2-style dependency injection library for Node.js

# Purpose


Inspired by the [Symfony2 Service Container](http://fabien.potencier.org/article/13/introduction-to-the-symfony-service-container)

A service container increases the usability of classes by allowing a configuration
file to specify which classes should be used to construct a class.  The container
will construct an instance of the class for you using the parameters that you
specify, allowing you to specify different classes to use in different situations
or different environments.

For example, if you have a class that makes HTTP requests.  In your production
environment you would want this to be a real http client.  In your unit test
environment, there is significant complication and overhead in using a real HTTP
client, so you would probably want to use a mock class instead that delivers canned
and predictable responses.

With a service container, you can reconfigure your class through a configuration
file without actually touching your code.

The Symfony 2 Guide Book provides a great [explanation](http://symfony.com/doc/current/book/service_container.html)


# Installation


    npm install @draw-js/service-container

Or add to your package.json dependencies.


# Usage

There are two pieces to using the service container, the container itself and the
`services.json` configuration files.

The `services.json` file specifies [3 types of dependency injection](http://symfony.com/doc/current/components/dependency_injection/types.html):
* Constructor Injection
* Setter Injection
* Property Injection

Constructor injection allows you to specify JSON literal parameters as arguments
for your class instances or it will allow you to specify another service as an
argument (be careful about circular dependencies!).

Setter injection will attempt to call the method that you specify with the arguments
(either parameters or other services) that you define.  This is useful for adding
dependency injection for existing libraries that do not conform to Constructor
Injection.

Property injection will directly attempt to set the property on the object with
the argument that you specify, either another service or a JSON literal parameter.


## Initializing and using the container

Create a container like:

```javascript
const ServiceContainer = require('service-container');

// Load your configuration file
const container = ServiceContainer.buildContainer(__dirname + '/services.json');
```

Get an instance of a service like:

```javascript
// Get an example mailer service
const mailer = container.get('mailer');
mailer.sendMail('Hello');

// Get a parameter
const maxcount = container.getParameter('mailer.maxcount');
```

The section below goes over how to configure and construct services.

## services.json

When initializing the container, you'll pass the full path of the services.json file.


```javascript
{
  "parameters": {
    "dependency_service.file":"./CoolClass",   // File paths are relative to the services.json file
    "dependency2_service.file":"./OtherClass",
    "my_service.file":"MyClass",
    "my_service.example_param":"yes",          // Parameter names are arbitrary
    "my_service.obj_param":{isExample: true}   // Can use literals as parameters
  },
  "services": {
    "dependency_service": {
      "class":"%depency_service.file%",
      "arguments":[]  // No Arguments
    },
    "dependency2_service": {
      "class":"%depency2_service.file%",
      "arguments":[]
    },
    "my_service": {
      "class":"%my_service.file%" // Parameters use % symbols, services use @
      "arguments": ["@dependency_service", "%my_service.example_param%", "@?optional_service"] // Optional services have @? at the beginning
      "calls": [
        ["setSecondDependency", ["@dependency2_service"]] // Method calls have the method name and an array of arguments
      ],
      "properties": {
        "myServiceProperty":"%my_service.obj_param%"
      }
    }
  }
}
```

### Other Service Options

* `"constructorMethod"` - A specific constructor function if including a library that
  serves as a namespace for many constructors.  For example: `mylibrary.SomeClass`
  the constructorMethod would be "SomeClass".
* `"isObject"` - When including a service that is an object and not a constructor
  like the node module `fs`
* `"isSingleton"` - Create only one of these objects as a service which will be
  passed around everytime the service is called.  The default behavior is that
  new objects will be created everytime the user requests this service from the
  container.

### Importing Other Service Configuration Files

To support more complex service.json file organizations, the `"imports"` key allows
any JSON file to be parsed like a services.json file.  In terms of service and parameter
hierarchy, the imports are at the same level as the file that they are found in.
The imports are parsed top to bottom, and are all overridden by whatever content
is in the services.json file.

Since the imports is done via require, you can also imports file from another package or js file.


```javascript
{
  "imports": [
    "@scope/package-name/services.json",
    "../my_other_services.json",
    "./lib/stuff.json"
  ],
  "parameters": {
    // ...
  },
  "services": {
    // ...
  }
}
```


### Namespaces

In addition to imports, another key feature for a complex application is the
use of namespaces.  Within any of your `services.json` files, you can apply a
namespace which will be prefixed to all of the paramters and services defined
in that file.  In addition, the namespace will be prepended to any files that
are imported via a name-spaced file and if they have their own namespace, it
will be applied after the namespace from the importing file.

All of the references within a `services.json` file using a namespace will prefer
parameters and services using that namespace and if no matching parameter or
service can be found, it will graduate to the non-namespaced version of the
service or parameter name.

So for example:

```javascript
{
  "namespace": "api_models.v2",
  "parameters": {
    "user.class": "./User.js"
  },
  "services": {
    "user": {"class": "%user.class%"}
  }
}
```

In the example above, you would actually retrieve the user service from the
container by including the namespace:

    var User = container.get('api_models.v2.user');

And although the user class is specified by `user.class`, it will actually
look up the parameter named `api_models.v2.user.class` first, and if that is
not found, it will use the parameter `user.class`.


## Examples

Check out the `example` directory to see some of the more common use cases for a
service container.

Included:
* Basic usage
* Overriding/Using mocks with the environment option
* Using an argument as a service


##TODO
* fixed the test
* tags
* scoped services

## Run the Tests

    make unittest

## Create Unit Test Coverage

    make coverage

Open the file `coverage.html` that gets generated in the root directory
