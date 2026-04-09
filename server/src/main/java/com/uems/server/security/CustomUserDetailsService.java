package com.uems.server.security;

import com.uems.server.model.User;
import com.uems.server.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Since username is no longer unique, JWT subject stores user's email.
     * This method is called with email as the identifier.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Try loading by email first (primary path — JWT tokens contain email)
        User user = userRepository.findByEmail(email)
                .orElseGet(() ->
                    // Fallback: try by username for backward compatibility (admin single user)
                    userRepository.findByUsername(email)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email))
                );

        String roleName = user.getRole() != null ? user.getRole().getName() : "ROLE_USER";
        roleName = roleName.toUpperCase();
        if (!roleName.startsWith("ROLE_")) roleName = "ROLE_" + roleName;

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(), // Use email as Spring Security principal
                user.getPassword(),
                List.of(new SimpleGrantedAuthority(roleName))
        );
    }
}
