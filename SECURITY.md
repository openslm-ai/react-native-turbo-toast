# Security Policy

## Supported Versions

We actively support the following versions of react-native-turbo-toast:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting Security Vulnerabilities

We take security vulnerabilities seriously and appreciate your help in keeping our users safe.

### How to Report

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please email us directly at: `security@openslm.ai`

Include the following information:
- Type of issue (buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### What to Expect

- We will acknowledge receipt of your report within 48 hours
- We will provide a detailed response within 7 days indicating next steps
- We will work with you to understand and validate the issue
- We will develop and test a fix
- We will coordinate the release of the fix and any public disclosure

## Security Considerations

### Native Code Security

This library includes native code for iOS and Android:

- **iOS**: Objective-C/C++ implementation with memory management
- **Android**: Kotlin implementation with proper lifecycle handling
- **Web**: DOM manipulation with XSS prevention

### Data Handling

- Toast messages are displayed as-is without HTML interpretation on native platforms
- Web implementation uses `textContent` (not `innerHTML`) to prevent XSS
- No sensitive data should be included in toast messages as they are visible to users

### Permissions

This library requires no special permissions and:
- Does not access device storage
- Does not access network capabilities
- Does not access camera or microphone
- Only displays UI elements (toasts)

### Known Limitations

- Web implementation manipulates DOM directly
- Native implementations use system toast APIs
- No encryption of toast content (not recommended for sensitive data)

## Best Practices

When using this library:

1. **Input Validation**: Validate and sanitize any user input before displaying in toasts
2. **Sensitive Data**: Never display passwords, tokens, or sensitive information in toasts
3. **Length Limits**: Keep toast messages concise to prevent UI issues
4. **Rate Limiting**: Implement application-level rate limiting to prevent toast spam

## Dependencies

This library has minimal dependencies:
- React Native core (peer dependency)
- No third-party runtime dependencies
- Build-time dependencies are scanned for vulnerabilities

## Updates

Security updates will be released as patch versions and will be clearly marked in release notes. Users are encouraged to update promptly when security patches are available.

## Contact

For any security-related questions or concerns:
- Email: security@openslm.ai
- GPG Key: Available upon request

Thank you for helping keep react-native-turbo-toast secure!