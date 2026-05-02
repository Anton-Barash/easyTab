# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /path/to/sdk/tools/proguard/proguard-android.txt

# Keep line numbers for better crash reports
-keepattributes SourceFile,LineNumberTable

# Keep WebView
-keep class android.webkit.** { *; }
