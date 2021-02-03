//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'
import { XApp } from '../../engine/app/XApp';
import { XSprite } from '../../engine/sprite/XSprite';
import { XSpriteLayer } from '../../engine/sprite/XSpriteLayer';
import { XSignal } from '../../engine/signals/XSignal';
import { XSignalManager } from '../../engine/signals/XSignalManager';
import { world } from '../app';
import { XTask } from '../../engine/task/XTask';
import { XTaskManager} from '../../engine/task/XTaskManager';
import { XTaskSubManager} from '../../engine/task/XTaskSubManager';
import { XWorld} from '../../engine/sprite/XWorld';
import { XType } from '../../engine/type/XType';
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { XGameController } from '../../engine/state/XGameController';
import { Login } from './Login';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';
import { CreateRoom } from '../moderator/CreateRoom';
import { JoinRoom } from '../player/JoinRoom';
import { XGameInstance } from '../../engine/state/XGameInstance';

//------------------------------------------------------------------------------------------
export class DATGameInstance extends XGameInstance {

//------------------------------------------------------------------------------------------	
	constructor () {
		super ();
	}
	
//------------------------------------------------------------------------------------------
    public setup (__world:XWorld):void {
        super.setup (__world);
    }

//------------------------------------------------------------------------------------------
    public cleanup ():void {
        super.cleanup ();
    }
	
//------------------------------------------------------------------------------------------
}