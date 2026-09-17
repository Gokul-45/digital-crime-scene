package com.crimescene;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Digital Crime Scene Reconstruction System
 * Main Spring Boot Application Entry Point
 */
@SpringBootApplication
public class CrimeSceneApplication {
    public static void main(String[] args) {
        SpringApplication.run(CrimeSceneApplication.class, args);
        System.out.println("""
            ╔══════════════════════════════════════════════════════════╗
            ║     DIGITAL CRIME SCENE RECONSTRUCTION SYSTEM           ║
            ║     Backend API running on http://localhost:8080         ║
            ║     H2 Console:  http://localhost:8080/h2-console       ║
            ╚══════════════════════════════════════════════════════════╝
            """);
    }
}
