//------------------------------------------------------------------------------------------
// app.ts
//------------------------------------------------------------------------------------------
import { G } from '../engine/app/G';
import { XApp } from '../engine/app/XApp';
import { ImageResource } from '../engine/resource/ImageResource';
import { MusicResource } from '../engine/resource/MusicResource';
import { SoundResource } from '../engine/resource/SoundResource';
import { SpriteSheetResource } from '../engine/resource/SpriteSheetResource';
import { ResourceSpec } from '../engine/resource/XResourceManager';
import { XWorld } from '../engine/sprite/XWorld';
import { XGameController } from '../engine/state/XGameController';
import { FpsMeter } from './fps-meter';
import { TestGameController } from './test/TestGameController';
import { DATGameController } from './game/DATGameController';
import { XSignal } from '../engine/signals/XSignal';

//------------------------------------------------------------------------------------------
(window as any).decomp = require('poly-decomp');

//------------------------------------------------------------------------------------------
export var g_XApp:XApp;
export var world:XWorld;

let fpsMeter: FpsMeter;

//------------------------------------------------------------------------------------------
window.onload = () => {
    var __main:Main = new Main (
        {
            onStateChange: () => {}
        }
    );

    __main.setup ();
} 

//------------------------------------------------------------------------------------------
export class Main {
    public m_gameController:XGameController;
    public m_debugMessage:string;
    public m_intervalTimer:any;
    public fpsMeterItem:any;
    public m_delay:number;

//------------------------------------------------------------------------------------------
    constructor (__params:any) {
        G.main = this;
    }

//------------------------------------------------------------------------------------------
    public setup (__container:HTMLElement = null):void {
        g_XApp = new XApp (
            this,
            {
                containerId: 'game',
                canvasW: G.CANVAS_WIDTH,
                canvasH: G.CANVAS_HEIGHT,
                fpsMax: 60,
                devicePixelRatio: window.devicePixelRatio,
            },

            __container
        );

        console.log (": starting: ");

        // return;
        
        world = new XWorld (g_XApp.stage, g_XApp, 8);
        world.setup ();
        g_XApp.stage.addChild (world);

        this.m_debugMessage = "";

        /* FPS */
        this.fpsMeterItem = document.createElement('div');
        this.fpsMeterItem.classList.add ('fps');
        g_XApp.container.appendChild (this.fpsMeterItem);

        fpsMeter = new FpsMeter (() => {
            this.fpsMeterItem.innerHTML = 'FPS: ' + fpsMeter.getFrameRate().toFixed(2).toString() + " : " + this.m_debugMessage;
        });

        this.m_intervalTimer = setInterval (this.update.bind (this), 1000.0 / g_XApp.fpsMax);
        this.render ();

        this.configureAndLoadAssets ();

        this.m_delay = 1;

        this.reset ();
    }

//------------------------------------------------------------------------------------------
    public cleanup ():void {
        g_XApp.container.removeChild (this.fpsMeterItem);

        clearInterval (this.m_intervalTimer);

        if (this.m_gameController != null) {
            this.m_gameController.nuke ();

            this.m_gameController = null;
        }

        world.cleanup ();
        
        g_XApp.stage.removeChild (world);

        g_XApp.cleanup ();
    }

//------------------------------------------------------------------------------------------
    public fatalError (__message:string):void {
    }
    
//------------------------------------------------------------------------------------------
    public setDebugMessage (__message:string):void {
        this.m_debugMessage = __message;
    }

//------------------------------------------------------------------------------------------
    public pause ():void {
        console.log (": pause: ");

        g_XApp.pause ();
    }

//------------------------------------------------------------------------------------------
    public resume ():void {
        console.log (": resume: ");

        g_XApp.resume ();
    }

//------------------------------------------------------------------------------------------
    public reset ():void {
        console.log (": reset: ");

        g_XApp.resume ();

        if (this.m_gameController != null) {
            this.m_gameController.nuke ();

            this.m_gameController = null;
        }

        this.m_gameController = new DATGameController ();
        this.m_gameController.setup (world, 0, 0.0);
        this.m_gameController.afterSetup ([]);

        this.m_delay = 30;
    }

//------------------------------------------------------------------------------------------
    public setMusic (__on:boolean):void {
        console.log (": music: ", __on);

        g_XApp.muteMusic (!__on);
    }

//------------------------------------------------------------------------------------------
    public setSound (__on:boolean):void {
        console.log (": sound: ", __on);

        g_XApp.muteSFX (!__on);
    }

//------------------------------------------------------------------------------------------
    public isReady ():boolean {
        return this.m_delay == 0;
    }

//------------------------------------------------------------------------------------------
    public update () {
        if (this.m_delay > 0) {
            this.m_delay--;
        }

        if (!g_XApp.hasFocus ()) {
            return;
        }

        fpsMeter.updateTime ();

        g_XApp.update ();

        world.update ();

        world.clearCollisions ();

        world.updateCollisions ();
    }

//------------------------------------------------------------------------------------------
    public render () {
        console.log (": render: ");

        if (g_XApp.renderer == null) {
            return;
        }
        
        requestAnimationFrame (this.render.bind (this));

        g_XApp.renderer.render (g_XApp.stage);

        fpsMeter.tick ();
    }

//------------------------------------------------------------------------------------------
    public configureAndLoadAssets ():void {
        g_XApp.getXProjectManager ().registerType ("SpriteSheet", SpriteSheetResource);
        g_XApp.getXProjectManager ().registerType ("ImageResource", ImageResource);
        g_XApp.getXProjectManager ().registerType ("SoundResource", SoundResource);
        g_XApp.getXProjectManager ().registerType ("MusicResource", MusicResource);

        g_XApp.getXProjectManager ().setup (
            "assets/Common.xml",
            {
                /*
                "images": "images",
                "assets": `${assetPrefix}assets/Cows/Project`,
                "levels": `${assetPrefix}assets/levels`,
                "sounds": `${assetPrefix}assets/sounds`,
                "music": `${assetPrefix}assets/music`,
                "backgrounds": `${assetPrefix}assets/backgrounds`,
                "sprites": `${assetPrefix}assets/sprites`,
                */
            },
            () => {
                this.queueTestAudioResources ();
                this.queueIntroResources ();

                g_XApp.getXProjectManager ().loadCowResources ();
            }
        );
    }

//------------------------------------------------------------------------------------------
    public queueIntroResources ():void {
                    
        //------------------------------------------------------------------------------------------
        g_XApp.getXProjectManager ().queueResources ([

            //------------------------------------------------------------------------------------------
            // intro images
            //------------------------------------------------------------------------------------------
            {
                name: "Clock_AgathaSaxCoburn_Intro",
                type: "ImageResource",
                path: "images/Aggie Intro/Clock_AgathaSaxCoburn_Intro.png",
            },
            {
                name: "Location_AgathaSaxCoburn_Intro",
                type: "ImageResource",
                path: "images/Aggie Intro/Location_AgathaSaxCoburn_Intro.png",
            },
            {
                name: "LuciaGuage_AgathaSaxCoburn_Intro",
                type: "ImageResource",
                path: "images/Aggie Intro/LuciaGuage_AgathaSaxCoburn_Intro.png",
            },
            {
                name: "Profile_AgathaSaxCoburn_Intro",
                type: "ImageResource",
                path: "images/Aggie Intro/Profile_AgathaSaxCoburn_Intro.png",
            },
            {
                name: "SavageHall_AgathaSaxCoburn_Intro",
                type: "ImageResource",
                path: "images/Aggie Intro/SavageHall_AgathaSaxCoburn_Intro.png",
            },
            {
                name: "TalismansInUse_AgathaSaxCoburn_Intro",
                type: "ImageResource",
                path: "images/Aggie Intro/TalismansInUse_AgathaSaxCoburn_Intro.png",
            },
            {
                name: "WW2_AgathaSaxCoburn_Intro",
                type: "ImageResource",
                path: "images/Aggie Intro/WW2_AgathaSaxCoburn_Intro.png",
            },
            {
                name: "Clock_PillipCalloway_Intro",
                type: "ImageResource",
                path: "images/Calloway Intro/Clock_PillipCalloway_Intro.png",
            },
            {
                name: "Location_PillipCalloway_Intro",
                type: "ImageResource",
                path: "images/Calloway Intro/Location_PillipCalloway_Intro.png",
            },
            {
                name: "LuciaGuage_PillipCalloway_Intro",
                type: "ImageResource",
                path: "images/Calloway Intro/LuciaGuage_PillipCalloway_Intro.png",
            },
            {
                name: "Profile_PillipCalloway_Intro",
                type: "ImageResource",
                path: "images/Calloway Intro/Profile_PillipCalloway_Intro.png",
            },
            {
                name: "SavageHall_PillipCalloway_Intro",
                type: "ImageResource",
                path: "images/Calloway Intro/SavageHall_PillipCalloway_Intro.png",
            },
            {
                name: "TalismansInUse_PillipCalloway_Intro",
                type: "ImageResource",
                path: "images/Calloway Intro/TalismansInUse_PillipCalloway_Intro.png",
            },
            {
                name: "Thumbs.db",
                type: "ImageResource",
                path: "images/Calloway Intro/Thumbs.db",
            },
            {
                name: "WW2_PillipCalloway_Intro",
                type: "ImageResource",
                path: "images/Calloway Intro/WW2_PillipCalloway_Intro.png",
            },
            {
                name: "Clock_CharlesGoodwin_Intro",
                type: "ImageResource",
                path: "images/Goodwin Intro/Clock_CharlesGoodwin_Intro.png",
            },
            {
                name: "Location_CharlesGoodwin_Intro",
                type: "ImageResource",
                path: "images/Goodwin Intro/Location_CharlesGoodwin_Intro.png",
            },
            {
                name: "LuciaGuage_CharlesGoodwin_Intro",
                type: "ImageResource",
                path: "images/Goodwin Intro/LuciaGuage_CharlesGoodwin_Intro.png",
            },
            {
                name: "Profile_CharlesGoodwin_Intro",
                type: "ImageResource",
                path: "images/Goodwin Intro/Profile_CharlesGoodwin_Intro.png",
            },
            {
                name: "SavageHall_CharlesGoodwin_Intro",
                type: "ImageResource",
                path: "images/Goodwin Intro/SavageHall_CharlesGoodwin_Intro.png",
            },
            {
                name: "TalismansInUse_CharlesGoodwin_Intro",
                type: "ImageResource",
                path: "images/Goodwin Intro/TalismansInUse_CharlesGoodwin_Intro.png",
            },
            {
                name: "WW2_CharlesGoodwin_Intro",
                type: "ImageResource",
                path: "images/Goodwin Intro/WW2_CharlesGoodwin_Intro.png",
            },
            {
                name: "Clock_GraceSavage_Intro",
                type: "ImageResource",
                path: "images/Grace Intro/Clock_GraceSavage_Intro.png",
            },
            {
                name: "Location_GraceSavage_Intro",
                type: "ImageResource",
                path: "images/Grace Intro/Location_GraceSavage_Intro.png",
            },
            {
                name: "LuciaGuage_GraceSavage_Intro",
                type: "ImageResource",
                path: "images/Grace Intro/LuciaGuage_GraceSavage_Intro.png",
            },
            {
                name: "Profile_GraceSavage_Intro",
                type: "ImageResource",
                path: "images/Grace Intro/Profile_GraceSavage_Intro.png",
            },
            {
                name: "SavageHall_GraceSavage_Intro",
                type: "ImageResource",
                path: "images/Grace Intro/SavageHall_GraceSavage_Intro.png",
            },
            {
                name: "TalismansInUse_GraceSavage_Intro",
                type: "ImageResource",
                path: "images/Grace Intro/TalismansInUse_GraceSavage_Intro.png",
            },
            {
                name: "WW2_GraceSavage_Intro",
                type: "ImageResource",
                path: "images/Grace Intro/WW2_GraceSavage_Intro.png",
            },
            {
                name: "Clock_IsaacSavage_Intro",
                type: "ImageResource",
                path: "images/Isaac Intro/Clock_IsaacSavage_Intro.png",
            },
            {
                name: "Location_IsaacSavage_Intro",
                type: "ImageResource",
                path: "images/Isaac Intro/Location_IsaacSavage_Intro.png",
            },
            {
                name: "LuciaGuage_IsaacSavage_Intro",
                type: "ImageResource",
                path: "images/Isaac Intro/LuciaGuage_IsaacSavage_Intro.png",
            },
            {
                name: "Profile_IsaacSavage_Intro",
                type: "ImageResource",
                path: "images/Isaac Intro/Profile_IsaacSavage_Intro.png",
            },
            {
                name: "SavageHall_IsaacSavage_Intro",
                type: "ImageResource",
                path: "images/Isaac Intro/SavageHall_IsaacSavage_Intro.png",
            },
            {
                name: "TalismansInUse_IsaacSavage_Intro",
                type: "ImageResource",
                path: "images/Isaac Intro/TalismansInUse_IsaacSavage_Intro.png",
            },
            {
                name: "WW2_IsaacSavage_Intro",
                type: "ImageResource",
                path: "images/Isaac Intro/WW2_IsaacSavage_Intro.png",
            },
            {
                name: "Clock_AudryMarcel_Intro",
                type: "ImageResource",
                path: "images/Marcel Intro/Clock_AudryMarcel_Intro.png",
            },
            {
                name: "Location_AudryMarcel_Intro(1)",
                type: "ImageResource",
                path: "images/Marcel Intro/Location_AudryMarcel_Intro(1).png",
            },
            {
                name: "Location_AudryMarcel_Intro",
                type: "ImageResource",
                path: "images/Marcel Intro/Location_AudryMarcel_Intro.png",
            },
            {
                name: "LuciaGuage_AudryMarcel_Intro(1)",
                type: "ImageResource",
                path: "images/Marcel Intro/LuciaGuage_AudryMarcel_Intro(1).png",
            },
            {
                name: "LuciaGuage_AudryMarcel_Intro",
                type: "ImageResource",
                path: "images/Marcel Intro/LuciaGuage_AudryMarcel_Intro.png",
            },
            {
                name: "Profle_AudryMarcel_Intro(1)",
                type: "ImageResource",
                path: "images/Marcel Intro/Profle_AudryMarcel_Intro(1).png",
            },
            {
                name: "Profle_AudryMarcel_Intro",
                type: "ImageResource",
                path: "images/Marcel Intro/Profle_AudryMarcel_Intro.png",
            },
            {
                name: "SavageHall_AudryMarcel_Intro(1)",
                type: "ImageResource",
                path: "images/Marcel Intro/SavageHall_AudryMarcel_Intro(1).png",
            },
            {
                name: "SavageHall_AudryMarcel_Intro",
                type: "ImageResource",
                path: "images/Marcel Intro/SavageHall_AudryMarcel_Intro.png",
            },
            {
                name: "TalismansInUse_AudryMarcel_Intro(1)",
                type: "ImageResource",
                path: "images/Marcel Intro/TalismansInUse_AudryMarcel_Intro(1).png",
            },
            {
                name: "TalismansInUse_AudryMarcel_Intro",
                type: "ImageResource",
                path: "images/Marcel Intro/TalismansInUse_AudryMarcel_Intro.png",
            },
            {
                name: "WW2_AudryMarcel_Intro(1)",
                type: "ImageResource",
                path: "images/Marcel Intro/WW2_AudryMarcel_Intro(1).png",
            },
            {
                name: "WW2_AudryMarcel_Intro",
                type: "ImageResource",
                path: "images/Marcel Intro/WW2_AudryMarcel_Intro.png",
            },
            
        ], "Intro");
    }

//------------------------------------------------------------------------------------------
    public queueTestAudioResources ():void {
                
        //------------------------------------------------------------------------------------------
        g_XApp.getXProjectManager ().queueResources ([

            //------------------------------------------------------------------------------------------
            // common music
            //------------------------------------------------------------------------------------------
            {
                name: "Marcel",
                type: "MusicResource",
                path: "http://www.kablooey.com/DAT/02_ACT_01/MARCEL/DAT_HoFG_ACT01_MARCEL.mp3"
            },
            {
                name: "Isaac",
                type: "MusicResource",
                path: "http://www.kablooey.com/DAT/02_ACT_01/ISSAC/DAT_HoFG_ACT01_ISSAC.mp3"
            },
            {
                name: "Grace",
                type: "MusicResource",
                path: "http://www.kablooey.com/DAT/02_ACT_01/GRACE/DAT_HoFG_ACT01_GRACE.mp3"
            },
            {
                name: "Goodwin",
                type: "MusicResource",
                path: "http://www.kablooey.com/DAT/02_ACT_01/GOODWIN/DAT_HoFG_ACT01_GOODWIN.mp3"
            },
            {
                name: "Calloway",
                type: "MusicResource",
                path: "http://www.kablooey.com/DAT/02_ACT_01/CALLOWAY/DAT_HoFG_ACT01_CALLOWAY.mp3"
            },
            {
                name: "Aggie",
                type: "MusicResource",
                path: "http://www.kablooey.com/DAT/02_ACT_01/AGGIE/DAT_HoFG_ACT01_AGGIE.mp3"
            },
        ], "TestAudio");
    }

//------------------------------------------------------------------------------------------
}
