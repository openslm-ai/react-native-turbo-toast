#import <React/RCTBridgeModule.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNTurboToastSpec.h"

@interface TurboToast : NSObject <NativeTurboToastSpec>
#else
@interface TurboToast : NSObject <RCTBridgeModule>
#endif

@end