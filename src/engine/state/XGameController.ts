//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'
import { XApp } from '../app/XApp';
import { XSprite } from '../sprite/XSprite';
import { XSpriteLayer } from '../sprite/XSpriteLayer';
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';
import { world } from '../../scripts/app';
import { XTask } from '../task/XTask';
import { XTaskManager} from '../task/XTaskManager';
import { XTaskSubManager} from '../task/XTaskSubManager';
import { XWorld} from '../sprite/XWorld';
import { XType } from '../type/XType';
import { XGameObject} from '../gameobject/XGameObject';
import { XGameInstance } from './XGameInstance';
import { G } from '../app/G';

//------------------------------------------------------------------------------------------
export class XGameController extends XGameObject {
    public m_gameInstance:XGameInstance;

//------------------------------------------------------------------------------------------	
	constructor () {
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

		G.appX = this.m_gameInstance = XType.createInstance (this.getGameInstanceClass ());
		this.m_gameInstance.setup (this.world);
		
		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
		super.cleanup ();
		
		this.m_gameInstance.getGameStateObject ().nuke ();
	}

//------------------------------------------------------------------------------------------
	public getGameInstanceClass ():any {
		return XGameInstance;
	}

//------------------------------------------------------------------------------------------
    public getGameInstance ():XGameInstance {
        return this.m_gameInstance;
    }

//------------------------------------------------------------------------------------------
}