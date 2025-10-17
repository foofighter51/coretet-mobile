# Known Issues

## iOS 18.6 Simulator: Unable to Type in Input Fields

**Status**: Known iOS Bug (Not Fixable in App Code)

**Symptoms**:
- Unable to type in username/password fields in iOS 18.6 Simulator
- Xcode console shows: `[RTIInputSystemClient remoteTextInputSessionWithID:textSuggestionsChanged:] Can only set suggestions for an active session`
- AutoLayout constraint warnings for keyboard accessory view

**Root Cause**:
iOS 18.6 WKWebView has a bug where the keyboard input assistant (suggestion bar above keyboard) fails to establish a proper input session, blocking all text input.

**Workarounds**:
1. **RECOMMENDED**: Test on physical iPhone device - bug is simulator-specific
2. Use iOS 17.x simulator instead of iOS 18.6
3. Deploy via TestFlight for real device testing
4. Wait for iOS 18.7 / Xcode update with Apple's fix

**Verification**:
- App works perfectly in web browser (localhost:3000)
- App worked in iOS simulator with earlier iOS versions
- Issue appeared after iOS 18.6 update

**References**:
- Similar reports in Capacitor/WKWebView community
- Apple Bug Report: (pending submission)

**Date Identified**: 2025-10-17
**Last Updated**: 2025-10-17
