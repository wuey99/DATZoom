//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy';
import { XApp } from "../app/XApp";

//------------------------------------------------------------------------------------------
export class Resource {

    public m_path:string;
    public loader:PIXI.Loader;
    public m_loadComplete:boolean;
    public m_isDead:boolean;

    //------------------------------------------------------------------------------------------		
    constructor () {
        this.m_loadComplete = false;
        this.m_isDead = false;
    }

    //------------------------------------------------------------------------------------------
    public setup (__path:string, __loader:PIXI.Loader):void {
        this.m_path = __path;
        this.loader = __loader;
    }

    //------------------------------------------------------------------------------------------
    public load ():void {
    }

    //------------------------------------------------------------------------------------------
    public cleanup ():void {
        console.log (": resource: cleanup: ", this.m_path);

        this.m_isDead = true;
    }

    //------------------------------------------------------------------------------------------
    public getResource ():any {
        return null;
    }

    //------------------------------------------------------------------------------------------
    public getLoadComplete ():boolean {
        return this.m_loadComplete;
    }

//------------------------------------------------------------------------------------------
}