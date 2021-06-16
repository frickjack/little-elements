import AppContext from "../../../../../@littleware/little-elements/web/lib/appContext/appContext.js";

const world = globalThis || window;
let analyticsEnabled = false;

export const LittleAnalytics = {
    get isEnabled(): boolean {
        return analyticsEnabled;
    },

    gtag(a:any, b:any){
        if (world.dataLayer) {
            world.dataLayer.push(arguments);
        }
    }
};


const configKey = "littleware/little-apps/ga";

AppContext.get().then(
    async (cx) => {
        const configData = await cx.getConfig(configKey);
        const config = { ... configData.defaults, ... configData.overrides };
        if (config.uiCode) {
            analyticsEnabled = true;
            const gscript = document.createElement('script');
            gscript.async = true;
            gscript.src = `https://www.googletagmanager.com/gtag/js?id=${config.uiCode}`;
            document.head.appendChild(gscript);
            world.dataLayer = world.dataLayer || [];

            LittleAnalytics.gtag('js', new Date());
            LittleAnalytics.gtag('config', 'UA-15960292-3');
        }
    }
);
