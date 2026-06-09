# Build stage
FROM maven:3.9-eclipse-temurin-25 AS builder

WORKDIR /app

# Copy pom.xml and download dependencies
COPY backend/pom.xml .
RUN mvn dependency:go-offline

# Copy source code and build
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:25-jre-noble

WORKDIR /app

# Copy the JAR file from builder
COPY --from=builder /app/target/backend-0.0.1-SNAPSHOT.jar .

# Expose port
EXPOSE 10000

# Set the port
ENV SERVER_PORT=10000
ENV SPRING_PROFILES_ACTIVE=prod

# Run the application
CMD ["java", "-Xmx512M", "-Xms256M", "-jar", "backend-0.0.1-SNAPSHOT.jar"]
