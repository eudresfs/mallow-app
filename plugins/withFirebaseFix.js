
const {
  withDangerousMod,
  withAppDelegate,
  createRunOncePlugin,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const withFirebaseIosFix = (config) => {
  // 1. Create dummy Objective-C files to fool the Firebase plugin
  config = withDangerousMod(config, [
    "ios",
    (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const projectName = config.slug;
      const dummyAppDelegateDir = path.join(projectRoot, "ios", projectName);
      const headerPath = path.join(dummyAppDelegateDir, "AppDelegate.h");
      const sourcePath = path.join(dummyAppDelegateDir, "AppDelegate.m");

      const headerContent = `#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate>
@property (nonatomic, strong) UIWindow *window;
@end`;

      const sourceContent = `#import "AppDelegate.h"\n\n@implementation AppDelegate\n\n@end`;

      // Ensure the directory exists and write the files, overwriting if they exist
      // to ensure a clean state on each prebuild.
      fs.mkdirSync(dummyAppDelegateDir, { recursive: true });
      fs.writeFileSync(headerPath, headerContent);
      fs.writeFileSync(sourcePath, sourceContent);

      return config;
    },
  ]);

  // 2. Modify the actual Swift AppDelegate
  config = withAppDelegate(config, (config) => {
    if (config.modResults.language === "swift") {
      let contents = config.modResults.contents;

      // Add import if it's not there
      if (!contents.includes("import Firebase")) {
        contents = contents.replace(
          /import UIKit/g,
          `import UIKit\nimport Firebase`
        );
      }

      // Add configure() if it's not there
      const configureLine = `FirebaseApp.configure()`;
      if (!contents.includes(configureLine)) {
         const didFinishLaunchingWithOptions = "func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {";
         if (contents.includes(didFinishLaunchingWithOptions)) {
            contents = contents.replace(
                didFinishLaunchingWithOptions,
                `${didFinishLaunchingWithOptions}\n    ${configureLine}`
            );
         }
      }
      config.modResults.contents = contents;
    }
    return config;
  });

  return config;
};

module.exports = createRunOncePlugin(withFirebaseIosFix, "withFirebaseIosFix", "1.0.0");
