//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy';
import { XApp } from "../app/XApp";
import { Resource } from './Resource';
import { G } from '../../engine/app/G';

//------------------------------------------------------------------------------------------
export class ImageResource extends Resource {

    //------------------------------------------------------------------------------------------		
    constructor () {
        super ();
    }

    //------------------------------------------------------------------------------------------
    public load ():void {
		this.loader.add (this.m_path).load (() => {
            // console.log (": ImageResource: loadComplete: ", this);

            if (this.m_isDead) {
                console.log (": isDead: ", this.m_path);

                if (this.getResource () != null) {
                    (this.getResource () as PIXI.Texture).destroy ();
                }
            } else {
                this.m_loadComplete = true;
            }
        });

        this.loader.onError.add (() => {
        });
    }

    //------------------------------------------------------------------------------------------
    public getResource ():any {
        if (this.getLoadComplete ()) {
            return this.loader.resources[this.m_path].texture;
        } else {
            return null;
        }
    }

    //------------------------------------------------------------------------------------------
    public cleanup ():void {
        super.cleanup ();

        if (this.getResource () != null) {
            (this.getResource () as PIXI.Texture).destroy ();
        } else {
            console.log (": error: ", this.m_path);
        }
    }

//------------------------------------------------------------------------------------------
}