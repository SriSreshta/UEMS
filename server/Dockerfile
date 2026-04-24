# Build stage
FROM maven:3.9.5-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the pom.xml and install dependencies
COPY pom.xml .
# Download all required dependencies into one layer (helps with caching)
RUN mvn dependency:go-offline -B

# Copy the source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built jar file from the build stage
# Note: Based on your pom.xml, the generated jar is server-1.0.0.jar
COPY --from=build /app/target/server-1.0.0.jar app.jar

# Expose the standard Spring Boot port
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
