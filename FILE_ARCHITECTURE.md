# File Architecture

This diagram reflects the current file and folder structure of the workspace and the `demo` application module.

```mermaid
flowchart TB
    root["2526-11g-otj-AGGeorgiev22/"] --> readme["README.md"]
    root --> demo["demo/"]

    subgraph app["demo/ Maven + Spring Boot app"]
        demo --> wrapper["mvnw\nmvnw.cmd"]
        demo --> pom["pom.xml"]
        demo --> src["src/"]
        demo --> target["target/"]

        src --> main["main/"]
        src --> test["test/"]

        main --> java["java/com/example/demo/"]
        main --> resources["resources/"]

        java --> appMain["DemoApplication.java"]
        java --> controller["controller/ProductController.java"]
        java --> model["model/Product.java"]
        java --> repository["repository/ProductRepository.java"]
        java --> service["service/ProductService.java\nservice/ProductServiceImpl.java"]
        resources --> props["application.properties"]

        test --> testJava["java/com/example/demo/"]
        testJava --> tests["DemoApplicationTests.java"]

        target --> classes["classes/"]
        target --> testClasses["test-classes/"]
        classes --> builtProps["application.properties"]
        classes --> builtMain["com/example/demo/... compiled classes"]
        testClasses --> builtTests["com/example/demo/... compiled tests"]
    end
```

## Notes

- `src/main` holds the application source code and runtime resources.
- `src/test` holds test sources.
- `target` contains generated build artifacts from Maven and should be treated as output, not source.