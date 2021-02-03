//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy';
import { XSprite } from '../sprite/XSprite';
import { XWorld } from '../sprite/XWorld';
import { XGameObject} from '../gameobject/XGameObject';
import { XTask } from "../task/XTask";
import { XSignal } from '../signals/XSignal';
import { XApp } from '../app/XApp';
import { XType } from '../type/XType';
import { TextInput } from 'pixi-textinput-v5';

//------------------------------------------------------------------------------------------
export class Spacer extends XGameObject {
    public m_width:number;
    public m_height:number;

//------------------------------------------------------------------------------------------
	public constructor () {
		super ();
	}

//------------------------------------------------------------------------------------------
    public setup (__world:XWorld, __layer:number, __depth:number):XGameObject {
        super.setup (__world, __layer, __depth);

        return this;
    }

//------------------------------------------------------------------------------------------
    public afterSetup (__params:Array<any> = null):XGameObject {
        super.afterSetup (__params);	

        this.m_width = __params[0];
        this.m_height = __params[1];

        return this;
    }

//------------------------------------------------------------------------------------------
    public cleanup ():void {
        super.cleanup ();
    }

//------------------------------------------------------------------------------------------
    public get width ():number {
        return this.m_width;
    }

//------------------------------------------------------------------------------------------
    public get height ():number {
        return this.m_height;
    }

//------------------------------------------------------------------------------------------
    public getActualWidth ():number {
        return this.m_width;
    }

//------------------------------------------------------------------------------------------
    public getActualHeight ():number {
        return this.m_height;
    }

//------------------------------------------------------------------------------------------	
}
	
