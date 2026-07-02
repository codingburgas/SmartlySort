package com.example.demo.service;

import com.example.demo.model.User;

import java.util.List;

public interface UserService {
    User register(User user);
    List<User> getAllUsers();
    User getUserById(Long id);
    void deleteUser(Long id);
    User authenticate(String username, String rawPassword);
}
