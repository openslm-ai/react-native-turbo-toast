#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import <React/RCTBridge.h>
#import <UIKit/UIKit.h>

@interface TurboToastView : UIView
@property (nonatomic, copy) NSString *message;
@property (nonatomic, assign) NSTimeInterval duration;
@property (nonatomic, copy) NSString *position;
@property (nonatomic, copy) NSString *type;
@property (nonatomic, copy) NSString *backgroundColor;
@property (nonatomic, copy) NSString *textColor;
@property (nonatomic, assign) BOOL visible;
@property (nonatomic, copy) RCTDirectEventBlock onShow;
@property (nonatomic, copy) RCTDirectEventBlock onHide;
@property (nonatomic, copy) RCTDirectEventBlock onPress;

- (void)showToast;
- (void)hideToast;
@end

@implementation TurboToastView {
    UILabel *_label;
    UIView *_containerView;
    UITapGestureRecognizer *_tapGesture;
}

- (instancetype)init {
    if (self = [super init]) {
        [self setupView];
    }
    return self;
}

- (void)setupView {
    self.clipsToBounds = YES;
    self.layer.cornerRadius = 8.0;
    self.userInteractionEnabled = YES;

    _label = [[UILabel alloc] init];
    _label.font = [UIFont systemFontOfSize:14.0];
    _label.numberOfLines = 0;
    _label.textAlignment = NSTextAlignmentCenter;
    _label.translatesAutoresizingMaskIntoConstraints = NO;

    [self addSubview:_label];

    [NSLayoutConstraint activateConstraints:@[
        [_label.leadingAnchor constraintEqualToAnchor:self.leadingAnchor constant:16],
        [_label.trailingAnchor constraintEqualToAnchor:self.trailingAnchor constant:-16],
        [_label.topAnchor constraintEqualToAnchor:self.topAnchor constant:12],
        [_label.bottomAnchor constraintEqualToAnchor:self.bottomAnchor constant:-12]
    ]];

    _tapGesture = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleTap)];
    [self addGestureRecognizer:_tapGesture];

    // Initial state
    self.alpha = 0.0;
    self.hidden = YES;
}

- (void)handleTap {
    if (self.onPress) {
        self.onPress(@{});
    }
}

- (void)setMessage:(NSString *)message {
    _message = message;

    // Add icon based on type
    NSString *icon = [self iconForType:self.type];
    if (icon) {
        _label.text = [NSString stringWithFormat:@"%@ %@", icon, message];
    } else {
        _label.text = message;
    }
}

- (void)setType:(NSString *)type {
    _type = type;
    [self updateAppearance];
}

- (void)setBackgroundColor:(NSString *)backgroundColor {
    _backgroundColor = backgroundColor;
    [self updateAppearance];
}

- (void)setTextColor:(NSString *)textColor {
    _textColor = textColor;
    _label.textColor = [self colorFromHexString:textColor ?: @"#FFFFFF"];
}

- (void)setVisible:(BOOL)visible {
    _visible = visible;
    if (visible) {
        [self showToast];
    } else {
        [self hideToast];
    }
}

- (void)showToast {
    self.hidden = NO;

    [UIView animateWithDuration:0.3
                          delay:0.0
         usingSpringWithDamping:0.8
          initialSpringVelocity:0.5
                        options:UIViewAnimationOptionCurveEaseInOut
                     animations:^{
        self.alpha = 1.0;
        self.transform = CGAffineTransformIdentity;
    } completion:^(BOOL finished) {
        if (self.onShow) {
            self.onShow(@{});
        }
    }];
}

- (void)hideToast {
    [UIView animateWithDuration:0.3
                          delay:0.0
                        options:UIViewAnimationOptionCurveEaseInOut
                     animations:^{
        self.alpha = 0.0;
        self.transform = CGAffineTransformMakeScale(0.9, 0.9);
    } completion:^(BOOL finished) {
        self.hidden = YES;
        if (self.onHide) {
            self.onHide(@{});
        }
    }];
}

- (void)updateAppearance {
    if (_backgroundColor) {
        super.backgroundColor = [self colorFromHexString:_backgroundColor];
    } else {
        super.backgroundColor = [self defaultBackgroundColorForType:_type];
    }

    // Update shadow
    self.layer.shadowColor = [UIColor blackColor].CGColor;
    self.layer.shadowOffset = CGSizeMake(0, 2);
    self.layer.shadowOpacity = 0.15;
    self.layer.shadowRadius = 8;
}

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

@interface TurboToastViewManager : RCTViewManager
@end

@implementation TurboToastViewManager

RCT_EXPORT_MODULE(TurboToastView)

- (UIView *)view {
    return [[TurboToastView alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(message, NSString)
RCT_EXPORT_VIEW_PROPERTY(duration, NSTimeInterval)
RCT_EXPORT_VIEW_PROPERTY(position, NSString)
RCT_EXPORT_VIEW_PROPERTY(type, NSString)
RCT_EXPORT_VIEW_PROPERTY(backgroundColor, NSString)
RCT_EXPORT_VIEW_PROPERTY(textColor, NSString)
RCT_EXPORT_VIEW_PROPERTY(visible, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onShow, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onHide, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPress, RCTDirectEventBlock)

@end