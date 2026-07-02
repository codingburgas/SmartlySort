package com.example.demo.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.example.demo.exception.DuplicateUsernameException;
import com.example.demo.exception.InvalidCredentialsException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void registerHashesPasswordAndSaves() {
        when(userRepository.existsByUsername("bob")).thenReturn(false);
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        User user = new User();
        user.setUsername("bob");
        user.setPassword("secret");

        User saved = userService.register(user);

        assertThat(saved.getPassword()).isNotEqualTo("secret");
        assertThat(saved.getPassword()).startsWith("$2");
    }

    @Test
    void registerDuplicateThrows() {
        when(userRepository.existsByUsername("bob")).thenReturn(true);

        User user = new User();
        user.setUsername("bob");
        user.setPassword("secret");

        assertThatThrownBy(() -> userService.register(user))
                .isInstanceOf(DuplicateUsernameException.class);
    }

    @Test
    void authenticateSucceeds() {
        User user = new User();
        user.setUsername("bob");
        user.setPassword(new BCryptPasswordEncoder().encode("secret"));

        when(userRepository.findByUsername("bob")).thenReturn(Optional.of(user));

        User result = userService.authenticate("bob", "secret");

        assertThat(result.getUsername()).isEqualTo("bob");
    }

    @Test
    void authenticateWrongPasswordThrows() {
        User user = new User();
        user.setUsername("bob");
        user.setPassword(new BCryptPasswordEncoder().encode("secret"));

        when(userRepository.findByUsername("bob")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> userService.authenticate("bob", "wrong"))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void authenticateUnknownUserThrows() {
        when(userRepository.findByUsername("nobody")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.authenticate("nobody", "pass"))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void deleteUserMissingThrows() {
        when(userRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> userService.deleteUser(99L))
                .isInstanceOf(UserNotFoundException.class);
    }
}
