# Lost and Found — Backend Service Documentation

This document provides complete instructions for local execution, building, and deployment preparation of the Spring Boot backend application.

For optimal readability across various text editors and terminal environments, it is recommended to view this document using the DejaVu Sans font.

---

## Technical Stack Overview
* Runtime: Java 17 / 21
* Framework: Spring Boot 3.x (Spring Security, Spring Data JPA)
* Database: PostgreSQL
* Build Tool: Maven / Gradle

---

## Network Configuration and Ports
* **Backend Port:** 8080
* **API Base URL:** http://localhost:8080/api/v1
* **Default Profile:** dev

---

## Database Configuration
The application relies on PostgreSQL for persistent storage.

* **Database Name:** lost_found
* **Default Schema:** public

### PostgreSQL Setup Notes
1. Ensure the PostgreSQL service is active locally, on a remote server, or inside a Docker container.
2. Initialize the required database instance by executing the following SQL command:
   CREATE DATABASE lost_found;
3. Configure connection parameters using the environment variables detailed below.

---

## Required Environment Variables
The following environment variables must be injected into the application context before startup. 

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| SERVER_PORT | Port on which the application listens | 8080 |
| DB_HOST | Hostname or IP address of the PostgreSQL server | localhost |
| DB_PORT | Connection port for PostgreSQL | 5432 |
| DB_NAME | Name of the target database | lost_found |
| DB_USERNAME | Database administrative user | postgres |
| DB_PASSWORD | Password for the database user | secure_password_here |
| JWT_SECRET | Base64-encoded secret key for JWT verification | 404E635266556A586E3272357538782F413F4428472B4B6250655368566D5970 |

---

## Project Run and Build Commands

### Running the Spring Boot Application Locally
To launch the application directly from the source code in development mode:

Using Maven wrapper:
./mvnw spring-boot:run

Using Gradle wrapper:
./gradlew bootRun

### Building the Production Artifact
To compile the source code and pack it into a runnable JAR file:

Using Maven:
./mvnw clean package -DskipTests

Using Gradle:
./gradlew clean bootJar

### Running the Compiled Artifact
Execute the generated JAR file using the standard Java runtime command:
java -jar target/lost-and-found-backend.jar

---

## Example Endpoints

### 1. Authentication Service (Public Access)
* **POST** `/api/v1/auth/register` — Registers a new user account.
* **POST** `/api/v1/auth/login` — Authenticates credentials and returns a Bearer JWT token.

### 2. Item Management Service (Secured Access)
*Note: These endpoints require a valid JWT passed within the "Authorization: Bearer <token>" header.*
* **GET** `/api/v1/items` — Retrieves a list of all recorded lost and found items.
* **POST** `/api/v1/items` — Publishes a new lost or found item entry.
* **GET** `/api/v1/items/{id}` — Fetches specific details of an item by its unique identifier.

---

## DevSecOps and Infrastructure Notes
* All routes outside of `/api/v1/auth/**` are guarded by Spring Security. Access tokens must use the standard Bearer scheme.
* Hardcoding production secrets, credentials, or keys inside application.properties or application.yml files is strictly prohibited. 
* All runtime secrets must be passed via environment variables or fetched dynamically from an external secrets management tool (e.g., HashiCorp Vault, AWS Secrets Manager) during the deployment phase.
