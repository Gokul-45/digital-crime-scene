package com.crimescene.config;

import com.crimescene.models.User;
import com.crimescene.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    @Bean
    CommandLineRunner seedUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            seed(userRepository, passwordEncoder, "admin", "admin@dcsr.local", "System Administrator", User.Role.ADMIN, "DCSR-001");
            seed(userRepository, passwordEncoder, "det_sharma", "sharma@dcsr.local", "Detective Sharma", User.Role.INVESTIGATOR, "DCSR-002");
            seed(userRepository, passwordEncoder, "analyst_ak", "analyst@dcsr.local", "Forensic Analyst", User.Role.ANALYST, "DCSR-003");
        };
    }

    private void seed(UserRepository repo, PasswordEncoder encoder, String username, String email,
                      String fullName, User.Role role, String badge) {
        if (repo.existsByUsername(username)) return;

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(encoder.encode("password123"));
        user.setFullName(fullName);
        user.setRole(role);
        user.setBadgeNumber(badge);
        user.setDepartment("Digital Forensics Division");
        user.setIsActive(true);
        repo.save(user);
    }
}
