//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy';
import { XApp } from "../app/XApp";
import { Resource } from './Resource';
import { G } from '../../engine/app/G';

//------------------------------------------------------------------------------------------
export class SpriteSheetResource extends Resource {

    //------------------------------------------------------------------------------------------		
    constructor () {
        super ();
    }

    //------------------------------------------------------------------------------------------
    public load ():void {
		this.loader.add (this.m_path).load (() => {
            // console.log (": SpriteSheetResource: loadComplete: ", this);

            if (this.m_isDead) {
                console.log (": isDead: ", this.m_path);

                if (this.getResource () != null) {
                    (this.getResource () as PIXI.Spritesheet).destroy ();
                }
            } else {
                this.m_loadComplete = true;
            }
        });

        this.loader.onError.add (() => {
            G.main.fatalError ("unable to load resource: " + this.m_path);
        });
    }

    //------------------------------------------------------------------------------------------
    public getResource ():any {
        if (this.getLoadComplete ()) {
            return this.loader.resources[this.m_path].spritesheet;
        } else {
            return null;
        }
    }

    //------------------------------------------------------------------------------------------
    public cleanup ():void {
        super.cleanup ();
        
        if (this.getResource () != null) {
            (this.getResource () as PIXI.Spritesheet).destroy ();
        } else {
            console.log (": error: ", this.m_path);
        }
    }

//------------------------------------------------------------------------------------------
}