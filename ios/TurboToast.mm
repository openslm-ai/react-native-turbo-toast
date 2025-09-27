#import "TurboToast.h"
#import <UIKit/UIKit.h>
#import <objc/runtime.h>
#import <React/RCTBridge.h>
#import <React/RCTEventDispatcher.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTConversions.h>
#import <React/RCTUtils.h>
#import <RNTurboToastSpec/RNTurboToastSpec.h>
#endif

@interface TurboToast()
@property (nonatomic, strong) UIView *currentToastView;
@property (nonatomic, strong) NSTimer *dismissTimer;
@property (nonatomic, weak) RCTBridge *bridge;
@end

@implementation TurboToast

RCT_EXPORT_MODULE(TurboToast)

- (instancetype)init {
    if (self = [super init]) {
        _currentToastView = nil;
        _dismissTimer = nil;
    }
    return self;
}

- (void)setBridge:(RCTBridge *)bridge {
    _bridge = bridge;
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
    return std::make_shared<facebook::react::NativeTurboToastSpecJSI>(params);
}

- (void)show:(NSDictionary *)options
     resolve:(RCTPromiseResolveBlock)resolve
      reject:(RCTPromiseRejectBlock)reject {
#else

RCT_EXPORT_METHOD(show:(NSDictionary *)options
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
#endif

    dispatch_async(dispatch_get_main_queue(), ^{
        @try {
            // Hide any existing toast
            [self hideCurrentToast];

            // Extract options
            NSString *message = options[@"message"] ?: @"";
            NSString *position = options[@"position"] ?: @"bottom";
            NSString *type = options[@"type"] ?: @"default";
            NSString *backgroundColor = options[@"backgroundColor"];
            NSString *textColor = options[@"textColor"] ?: @"#FFFFFF";
            NSDictionary *action = options[@"action"];
            NSArray *actions = options[@"actions"];
            NSString *toastId = options[@"id"] ?: [[NSUUID UUID] UUIDString];
            NSString *iconUri = options[@"icon"];
            BOOL dismissOnPress = options[@"dismissOnPress"] ? [options[@"dismissOnPress"] boolValue] : YES;
            BOOL swipeToDismiss = options[@"swipeToDismiss"] ? [options[@"swipeToDismiss"] boolValue] : YES;
            NSNumber *animationDuration = options[@"animationDuration"] ?: @300;
            NSNumber *progress = options[@"progress"];
            BOOL showProgressBar = options[@"showProgressBar"] ? [options[@"showProgressBar"] boolValue] : NO;
            NSString *progressColor = options[@"progressColor"];
            NSString *accessibilityLabel = options[@"accessibilityLabel"];
            NSString *accessibilityHint = options[@"accessibilityHint"];
            NSString *accessibilityRole = options[@"accessibilityRole"];

            // Duration handling
            NSTimeInterval duration = 2.0; // default short
            id durationValue = options[@"duration"];
            if ([durationValue isKindOfClass:[NSString class]]) {
                if ([durationValue isEqualToString:@"long"]) {
                    duration = 3.5;
                }
            } else if ([durationValue isKindOfClass:[NSNumber class]]) {
                duration = [durationValue doubleValue] / 1000.0;
            }

            // Create toast view
            self.currentToastView = [self createToastViewWithMessage:message
                                                                type:type
                                                     backgroundColor:backgroundColor
                                                           textColor:textColor
                                                              action:action
                                                             iconUri:iconUri
                                                             toastId:toastId
                                                       dismissOnPress:dismissOnPress
                                                       swipeToDismiss:swipeToDismiss
                                                            progress:progress
                                                      showProgressBar:showProgressBar
                                                       progressColor:progressColor
                                                  accessibilityLabel:accessibilityLabel
                                                   accessibilityHint:accessibilityHint
                                                   accessibilityRole:accessibilityRole];

            // Position toast
            [self positionToast:self.currentToastView position:position];

            // Animate in
            [self animateToastIn:self.currentToastView duration:[animationDuration doubleValue] / 1000.0];

            // Set dismiss timer
            self.dismissTimer = [NSTimer scheduledTimerWithTimeInterval:duration
                                                                  target:self
                                                                selector:@selector(hide)
                                                                userInfo:nil
                                                                 repeats:NO];

            resolve(nil);
        } @catch (NSException *exception) {
            reject(@"TOAST_ERROR", exception.reason, nil);
        }
    });
}

#ifdef RCT_NEW_ARCH_ENABLED
- (void)hide {
#else
RCT_EXPORT_METHOD(hide) {
#endif
    dispatch_async(dispatch_get_main_queue(), ^{
        [self hideCurrentToast];
    });
}

#ifdef RCT_NEW_ARCH_ENABLED
- (void)hideAll {
#else
RCT_EXPORT_METHOD(hideAll) {
#endif
    dispatch_async(dispatch_get_main_queue(), ^{
        [self hideCurrentToast];
    });
}

#pragma mark - Private Methods

- (UIView *)createToastViewWithMessage:(NSString *)message
                                   type:(NSString *)type
                        backgroundColor:(NSString *)backgroundColor
                              textColor:(NSString *)textColor
                                 action:(NSDictionary *)action
                                iconUri:(NSString *)iconUri
                               toastId:(NSString *)toastId
                          dismissOnPress:(BOOL)dismissOnPress
                          swipeToDismiss:(BOOL)swipeToDismiss
                               progress:(NSNumber *)progress
                         showProgressBar:(BOOL)showProgressBar
                          progressColor:(NSString *)progressColor
                      accessibilityLabel:(NSString *)accessibilityLabel
                       accessibilityHint:(NSString *)accessibilityHint
                       accessibilityRole:(NSString *)accessibilityRole {

    UIWindow *window = RCTSharedApplication().keyWindow;

    // Create container view
    UIView *toastView = [[UIView alloc] init];
    toastView.layer.cornerRadius = 8.0;
    toastView.clipsToBounds = YES;
    toastView.alpha = 0.0;

    // Set accessibility properties
    toastView.isAccessibilityElement = YES;
    toastView.accessibilityLabel = accessibilityLabel ?: message;
    toastView.accessibilityHint = accessibilityHint;

    // Set accessibility trait based on role
    if ([accessibilityRole isEqualToString:@"alert"]) {
        toastView.accessibilityTraits = UIAccessibilityTraitStaticText | UIAccessibilityTraitUpdatesFrequently;
    } else {
        toastView.accessibilityTraits = UIAccessibilityTraitStaticText;
    }

    // Announce the toast for VoiceOver
    UIAccessibilityPostNotification(UIAccessibilityAnnouncementNotification, message);

    // Set background color
    if (backgroundColor) {
        toastView.backgroundColor = [self colorFromHexString:backgroundColor];
    } else {
        toastView.backgroundColor = [self defaultBackgroundColorForType:type];
    }

    // Create label
    UILabel *label = [[UILabel alloc] init];
    label.text = message;
    label.textColor = [self colorFromHexString:textColor];
    label.font = [UIFont systemFontOfSize:14.0];
    label.numberOfLines = 0;
    label.textAlignment = NSTextAlignmentCenter;

    // Add icon if needed
    NSString *icon = iconUri ?: [self iconForType:type];
    if (icon) {
        NSString *fullText = [NSString stringWithFormat:@"%@ %@", icon, message];
        label.text = fullText;
    }

    // Create horizontal stack view for label and action button
    UIStackView *stackView = [[UIStackView alloc] init];
    stackView.axis = UILayoutConstraintAxisHorizontal;
    stackView.alignment = UIStackViewAlignmentCenter;
    stackView.spacing = 12;
    stackView.translatesAutoresizingMaskIntoConstraints = NO;

    [stackView addArrangedSubview:label];

    // Add action buttons if provided (supports both single action and multiple actions)
    NSMutableArray *actionsList = [NSMutableArray array];
    if (actions && [actions isKindOfClass:[NSArray class]]) {
        [actionsList addObjectsFromArray:actions];
    } else if (action && action[@"text"]) {
        [actionsList addObject:action];
    }

    for (NSDictionary *actionItem in actionsList) {
        if (actionItem[@"text"]) {
            UIButton *actionButton = [UIButton buttonWithType:UIButtonTypeSystem];
            [actionButton setTitle:actionItem[@"text"] forState:UIControlStateNormal];

            // Style based on action style
            NSString *style = actionItem[@"style"] ?: @"default";
            if ([style isEqualToString:@"destructive"]) {
                [actionButton setTitleColor:[UIColor colorWithRed:1.0 green:0.27 blue:0.27 alpha:1.0] forState:UIControlStateNormal];
            } else if ([style isEqualToString:@"cancel"]) {
                [actionButton setTitleColor:[UIColor colorWithWhite:0.8 alpha:1.0] forState:UIControlStateNormal];
            } else {
                [actionButton setTitleColor:[self colorFromHexString:textColor] forState:UIControlStateNormal];
            }

            actionButton.titleLabel.font = [UIFont systemFontOfSize:14.0 weight:UIFontWeightSemibold];

            // Store toast ID and action index for handling
            actionButton.tag = arc4random_uniform(INT_MAX);
            objc_setAssociatedObject(actionButton, "toastId", toastId, OBJC_ASSOCIATION_RETAIN);
            objc_setAssociatedObject(actionButton, "actionStyle", style, OBJC_ASSOCIATION_RETAIN);

            [actionButton addTarget:self action:@selector(handleActionButton:) forControlEvents:UIControlEventTouchUpInside];
            [stackView addArrangedSubview:actionButton];
        }
    }

    [toastView addSubview:stackView];

    // Adjust constraints based on progress bar
    if (showProgressBar) {
        [NSLayoutConstraint activateConstraints:@[
            [stackView.leadingAnchor constraintEqualToAnchor:toastView.leadingAnchor constant:24],
            [stackView.trailingAnchor constraintEqualToAnchor:toastView.trailingAnchor constant:-24],
            [stackView.topAnchor constraintEqualToAnchor:toastView.topAnchor constant:12],
            [stackView.bottomAnchor constraintEqualToAnchor:toastView.bottomAnchor constant:-16] // Extra space for progress bar
        ]];
    } else {
        [NSLayoutConstraint activateConstraints:@[
            [stackView.leadingAnchor constraintEqualToAnchor:toastView.leadingAnchor constant:24],
            [stackView.trailingAnchor constraintEqualToAnchor:toastView.trailingAnchor constant:-24],
            [stackView.topAnchor constraintEqualToAnchor:toastView.topAnchor constant:12],
            [stackView.bottomAnchor constraintEqualToAnchor:toastView.bottomAnchor constant:-12]
        ]];
    }

    // Add progress bar if needed
    if (showProgressBar && progress) {
        UIView *progressContainer = [[UIView alloc] init];
        progressContainer.backgroundColor = [[UIColor whiteColor] colorWithAlphaComponent:0.2];
        progressContainer.translatesAutoresizingMaskIntoConstraints = NO;
        progressContainer.tag = 1000; // Tag for updates
        [toastView addSubview:progressContainer];

        UIView *progressBar = [[UIView alloc] init];
        if (progressColor) {
            progressBar.backgroundColor = [self colorFromHexString:progressColor];
        } else {
            progressBar.backgroundColor = [UIColor whiteColor];
        }
        progressBar.translatesAutoresizingMaskIntoConstraints = NO;
        progressBar.tag = 1001; // Tag for updates
        [progressContainer addSubview:progressBar];

        CGFloat progressValue = [progress floatValue];
        [NSLayoutConstraint activateConstraints:@[
            [progressContainer.leadingAnchor constraintEqualToAnchor:toastView.leadingAnchor],
            [progressContainer.trailingAnchor constraintEqualToAnchor:toastView.trailingAnchor],
            [progressContainer.bottomAnchor constraintEqualToAnchor:toastView.bottomAnchor],
            [progressContainer.heightAnchor constraintEqualToConstant:4],

            [progressBar.leadingAnchor constraintEqualToAnchor:progressContainer.leadingAnchor],
            [progressBar.topAnchor constraintEqualToAnchor:progressContainer.topAnchor],
            [progressBar.bottomAnchor constraintEqualToAnchor:progressContainer.bottomAnchor],
            [progressBar.widthAnchor constraintEqualToAnchor:progressContainer.widthAnchor multiplier:progressValue]
        ]];
    }

    // Add tap gesture if dismissOnPress
    if (dismissOnPress) {
        UITapGestureRecognizer *tap = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleToastTap:)];
        [toastView addGestureRecognizer:tap];
    }

    // Add swipe gesture if swipeToDismiss
    if (swipeToDismiss) {
        UISwipeGestureRecognizer *swipeLeft = [[UISwipeGestureRecognizer alloc] initWithTarget:self action:@selector(handleToastSwipe:)];
        swipeLeft.direction = UISwipeGestureRecognizerDirectionLeft;
        [toastView addGestureRecognizer:swipeLeft];

        UISwipeGestureRecognizer *swipeRight = [[UISwipeGestureRecognizer alloc] initWithTarget:self action:@selector(handleToastSwipe:)];
        swipeRight.direction = UISwipeGestureRecognizerDirectionRight;
        [toastView addGestureRecognizer:swipeRight];
    }

    // Add shadow
    toastView.layer.shadowColor = [UIColor blackColor].CGColor;
    toastView.layer.shadowOffset = CGSizeMake(0, 4);
    toastView.layer.shadowOpacity = 0.15;
    toastView.layer.shadowRadius = 12;

    [window addSubview:toastView];

    return toastView;
}

- (void)positionToast:(UIView *)toastView position:(NSString *)position {
    UIWindow *window = RCTSharedApplication().keyWindow;

    toastView.translatesAutoresizingMaskIntoConstraints = NO;

    NSMutableArray *constraints = [NSMutableArray array];

    // Horizontal centering
    [constraints addObject:[toastView.centerXAnchor constraintEqualToAnchor:window.centerXAnchor]];

    // Width constraints
    [constraints addObject:[toastView.widthAnchor constraintLessThanOrEqualToAnchor:window.widthAnchor multiplier:0.9]];
    [constraints addObject:[toastView.widthAnchor constraintGreaterThanOrEqualToConstant:200]];

    // Vertical positioning
    if ([position isEqualToString:@"top"]) {
        [constraints addObject:[toastView.topAnchor constraintEqualToAnchor:window.safeAreaLayoutGuide.topAnchor constant:20]];
    } else if ([position isEqualToString:@"center"]) {
        [constraints addObject:[toastView.centerYAnchor constraintEqualToAnchor:window.centerYAnchor]];
    } else { // bottom
        [constraints addObject:[toastView.bottomAnchor constraintEqualToAnchor:window.safeAreaLayoutGuide.bottomAnchor constant:-20]];
    }

    [NSLayoutConstraint activateConstraints:constraints];
}

- (void)animateToastIn:(UIView *)toastView duration:(NSTimeInterval)duration {
    toastView.transform = CGAffineTransformMakeTranslation(0, 100);

    [UIView animateWithDuration:duration
                          delay:0.0
         usingSpringWithDamping:0.8
          initialSpringVelocity:0.5
                        options:UIViewAnimationOptionCurveEaseInOut
                     animations:^{
        toastView.alpha = 1.0;
        toastView.transform = CGAffineTransformIdentity;
    } completion:nil];
}

- (void)handleActionButton:(UIButton *)sender {
    // Get the toast ID and action style
    NSString *toastId = objc_getAssociatedObject(sender, "toastId");
    NSString *actionStyle = objc_getAssociatedObject(sender, "actionStyle");

    // Send event to JavaScript
    if (toastId && self.bridge) {
        [self.bridge.eventDispatcher sendAppEventWithName:@"TurboToast:ActionPressed"
                                                      body:@{@"toastId": toastId, @"style": actionStyle ?: @"default"}];
    }

    // Only hide if not a cancel action
    if (![actionStyle isEqualToString:@"cancel"]) {
        [self hide];
    }
}

- (void)handleToastTap:(UITapGestureRecognizer *)gesture {
    [self hide];
}

- (void)handleToastSwipe:(UISwipeGestureRecognizer *)gesture {
    UIView *toastView = gesture.view;
    CGFloat translationX = gesture.direction == UISwipeGestureRecognizerDirectionLeft ? -300 : 300;

    [UIView animateWithDuration:0.3 animations:^{
        toastView.transform = CGAffineTransformMakeTranslation(translationX, 0);
        toastView.alpha = 0.0;
    } completion:^(BOOL finished) {
        [self hideCurrentToast];
    }];
}

- (void)animateToastOut:(UIView *)toastView completion:(void(^)(void))completion {
    [UIView animateWithDuration:0.3
                          delay:0.0
                        options:UIViewAnimationOptionCurveEaseInOut
                     animations:^{
        toastView.alpha = 0.0;
        toastView.transform = CGAffineTransformMakeTranslation(0, 100);
    } completion:^(BOOL finished) {
        [toastView removeFromSuperview];
        if (completion) {
            completion();
        }
    }];
}

- (void)hideCurrentToast {
    if (self.dismissTimer) {
        [self.dismissTimer invalidate];
        self.dismissTimer = nil;
    }

    if (self.currentToastView) {
        UIView *toastToHide = self.currentToastView;

        // Clear associated objects to prevent memory leaks
        for (UIView *subview in toastToHide.subviews) {
            if ([subview isKindOfClass:[UIStackView class]]) {
                for (UIView *stackSubview in ((UIStackView *)subview).arrangedSubviews) {
                    if ([stackSubview isKindOfClass:[UIButton class]]) {
                        objc_removeAssociatedObjects(stackSubview);
                    }
                }
            }
        }

        self.currentToastView = nil; // Clear reference immediately
        [self animateToastOut:toastToHide completion:nil];
    }
}

#pragma mark - Helper Methods

- (UIColor *)colorFromHexString:(NSString *)hexString {
    NSString *cleanString = [hexString stringByReplacingOccurrencesOfString:@"#" withString:@""];

    if (cleanString.length != 6) {
        return [UIColor blackColor];
    }

    NSScanner *scanner = [NSScanner scannerWithString:cleanString];
    unsigned int baseColor;
    [scanner scanHexInt:&baseColor];

    CGFloat red = ((baseColor >> 16) & 0xFF) / 255.0;
    CGFloat green = ((baseColor >> 8) & 0xFF) / 255.0;
    CGFloat blue = (baseColor & 0xFF) / 255.0;

    return [UIColor colorWithRed:red green:green blue:blue alpha:1.0];
}

- (UIColor *)defaultBackgroundColorForType:(NSString *)type {
    if ([type isEqualToString:@"success"]) {
        return [UIColor colorWithRed:76/255.0 green:175/255.0 blue:80/255.0 alpha:1.0];
    } else if ([type isEqualToString:@"error"]) {
        return [UIColor colorWithRed:244/255.0 green:67/255.0 blue:54/255.0 alpha:1.0];
    } else if ([type isEqualToString:@"warning"]) {
        return [UIColor colorWithRed:255/255.0 green:152/255.0 blue:0/255.0 alpha:1.0];
    } else if ([type isEqualToString:@"info"]) {
        return [UIColor colorWithRed:33/255.0 green:150/255.0 blue:243/255.0 alpha:1.0];
    } else {
        return [UIColor colorWithRed:51/255.0 green:51/255.0 blue:51/255.0 alpha:1.0];
    }
}

- (NSString *)iconForType:(NSString *)type {
    if ([type isEqualToString:@"success"]) {
        return @"✓";
    } else if ([type isEqualToString:@"error"]) {
        return @"✕";
    } else if ([type isEqualToString:@"warning"]) {
        return @"⚠";
    } else if ([type isEqualToString:@"info"]) {
        return @"ⓘ";
    } else {
        return nil;
    }
}

@end