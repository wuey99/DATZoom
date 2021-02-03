//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy';
import { XApp } from "../app/XApp";
import { Resource} from './Resource';
import { SpriteSheetResource } from './SpriteSheetResource';
import { XTask } from '../task/XTask';
import { XType } from '../type/XType';
import { XProjectManager } from './XProjectManager';

//------------------------------------------------------------------------------------------
export interface ResourceSpec {
    name:string;
    type:string;
    path:string;
}

//------------------------------------------------------------------------------------------
export class XResourceManager {
    public m_XApp:XApp;
    public m_projectManager:XProjectManager;
    public m_resourceMap:Map<string, Resource>;
    public m_queues:Array<Array<Resource>>;
    public loaders:Array<PIXI.Loader>;
    public m_paused:boolean;
    public m_loadedFiles:number;
    public m_totalFiles:number;

    public static NUM_QUEUES:number = 4; // has to be a power of two.

    //------------------------------------------------------------------------------------------		
    constructor (__XApp:XApp, __projectManager:XProjectManager) {
        this.m_XApp = __XApp;
        this.m_projectManager = __projectManager;

        this.m_resourceMap = new Map<string, Resource> ();
        this.m_queues = new Array<Array<Resource>> ();
        this.loaders = new Array<PIXI.Loader> ();

        this.m_paused = false;

        this.m_loadedFiles = 0;
        this.m_totalFiles = 0;

        var i:number;

        for (i = 0; i < XResourceManager.NUM_QUEUES; i++) {
            this.m_queues.push (new Array<Resource> ());
            this.loaders.push (new PIXI.Loader ());

            this.checkQueueTask (i);
        }
    }

    //------------------------------------------------------------------------------------------
    public cleanup ():void {
        var __name:string;

        console.log (": XResourceManager: cleanup: ");

        for (__name of this.m_resourceMap.keys ()) {
            var __resource:Resource = this.m_resourceMap.get (__name);
            __resource.cleanup ();

            this.m_resourceMap.delete (__name);
        }

        var __loader:PIXI.Loader;

        for (__loader of this.loaders) {
            __loader.destroy ();
        }
    }

    //------------------------------------------------------------------------------------------
    public pause ():void {
        this.m_paused = true;
    }

    //------------------------------------------------------------------------------------------
    public start ():void {
        this.m_paused = false;
    }
    
    //------------------------------------------------------------------------------------------
    public checkQueueTask (__queueIndex:number):void {
        var __currentResource:Resource = null;

        this.m_XApp.getXTaskManager ().addTask ([
            XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,
                    XTask.FLAGS, (__task:XTask) => {
                        __task.ifTrue (this.m_paused);
                    }, XTask.BEQ, "loop",

                    XTask.FLAGS, (__task:XTask) => {
                        if (this.m_queues[__queueIndex].length > 0) {
                            __currentResource = this.m_queues[__queueIndex].pop ();

                            __currentResource.load ();

                            __task.ifTrue (true);
                        } else {
                            __task.ifTrue (false);
                        }
                    }, XTask.BNE, "loop",

            XTask.LABEL, "wait",
                XTask.WAIT, 0x0100,

                XTask.FLAGS, (__task:XTask) => {
                    __task.ifTrue (__currentResource.getLoadComplete ());
                }, XTask.BNE, "wait",

                () => {
                    this.m_loadedFiles++;
                },

            XTask.GOTO, "loop",

            XTask.RETN,
        ]);
    }

    //------------------------------------------------------------------------------------------
    public getLoadedFiles ():number {
        return this.m_loadedFiles;
    }

    //------------------------------------------------------------------------------------------
    public getTotalFiles ():number {
        return this.m_totalFiles;
    }
    
    //------------------------------------------------------------------------------------------
    public getResourceMap ():Map<string, Resource> {
        return this.m_resourceMap;
    }

    //------------------------------------------------------------------------------------------
    public queueResources (__resourceList:Array<ResourceSpec>):void {
        this.loadResources (__resourceList, true);
    }

    //------------------------------------------------------------------------------------------
    public loadResources (__resourceList:Array<ResourceSpec>, __paused:boolean = false):void {
        this.m_paused = __paused;

        var __resourceSpec:ResourceSpec;

        console.log (": resourceList: ", __resourceList);

        var __queueIndex:number = 0;

        for (__resourceSpec of __resourceList) {
            if (this.m_resourceMap.get (__resourceSpec.name) == null) {
                var __resource:Resource;

                __resource = XType.createInstance (this.m_projectManager.getTypeMap ().get (__resourceSpec.type));
                __resource.setup (this.m_projectManager.translateAlias (__resourceSpec.path), this.loaders[__queueIndex]);

                this.m_queues[__queueIndex].push (__resource);

                __queueIndex = (__queueIndex + 1) & (XResourceManager.NUM_QUEUES - 1);
                
                this.m_totalFiles++;

                this.m_resourceMap.set (__resourceSpec.name, __resource);
            }
        }
    }

    //------------------------------------------------------------------------------------------
    public getResourceByName (__name:string):any {
        var __resource:Resource = this.m_resourceMap.get (__name);

        if (__resource != null) {
            return __resource.getResource ();
        } else {
            return null;
        }
    }

    //------------------------------------------------------------------------------------------
    public getLoadComplete ():boolean {
        var __loadComplete:boolean = true;

        var __name:string;

        for (__name of this.m_resourceMap.keys ()) {
            var __resource:Resource = this.m_resourceMap.get (__name);

            if (!__resource.getLoadComplete ()) {
                __loadComplete = false;
            }

            // console.log (": ResoruceManager: getLoadComplete: ", __resource, __loadComplete);
        }

        return __loadComplete;
    }

//------------------------------------------------------------------------------------------
}