#import "TurboToast.h"
#import <UIKit/UIKit.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTConversions.h>
#import <React/RCTUtils.h>
#import <RNTurboToastSpec/RNTurboToastSpec.h>
#endif

@interface TurboToast()
@property (nonatomic, strong) UIView *currentToastView;
@property (nonatomic, strong) NSTimer *dismissTimer;
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
                                                           textColor:textColor];

            // Position toast
            [self positionToast:self.currentToastView position:position];

            // Animate in
            [self animateToastIn:self.currentToastView];

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
                              textColor:(NSString *)textColor {

    UIWindow *window = RCTSharedApplication().keyWindow;

    // Create container view
    UIView *toastView = [[UIView alloc] init];
    toastView.layer.cornerRadius = 8.0;
    toastView.clipsToBounds = YES;
    toastView.alpha = 0.0;

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
    NSString *icon = [self iconForType:type];
    if (icon) {
        NSString *fullText = [NSString stringWithFormat:@"%@ %@", icon, message];
        label.text = fullText;
    }

    // Layout
    label.translatesAutoresizingMaskIntoConstraints = NO;
    [toastView addSubview:label];

    [NSLayoutConstraint activateConstraints:@[
        [label.leadingAnchor constraintEqualToAnchor:toastView.leadingAnchor constant:24],
        [label.trailingAnchor constraintEqualToAnchor:toastView.trailingAnchor constant:-24],
        [label.topAnchor constraintEqualToAnchor:toastView.topAnchor constant:12],
        [label.bottomAnchor constraintEqualToAnchor:toastView.bottomAnchor constant:-12]
    ]];

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

- (void)animateToastIn:(UIView *)toastView {
    toastView.transform = CGAffineTransformMakeTranslation(0, 100);

    [UIView animateWithDuration:0.3
                          delay:0.0
         usingSpringWithDamping:0.8
          initialSpringVelocity:0.5
                        options:UIViewAnimationOptionCurveEaseInOut
                     animations:^{
        toastView.alpha = 1.0;
        toastView.transform = CGAffineTransformIdentity;
    } completion:nil];
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