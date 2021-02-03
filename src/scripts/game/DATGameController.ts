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
import { CreateRoom2 } from '../moderator/CreateRoom2';
import { ModeratorCharacterSelect } from '../moderator/ModeratorCharacterSelect';
import { PlayerCharacterSelect } from '../player/PlayerCharacterSelect';
import { PlayerIntro } from '../player/PlayerIntro';
import { AudioTest } from '../moderator/AudioTest';
import { JoinRoom } from '../player/JoinRoom';
import { XMLScene } from '../scene/XMLScene';
import { DATGameInstance } from './DATGameInstance';

//------------------------------------------------------------------------------------------
export class DATGameController extends XGameController {

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

		this.getGameInstance ().registerState ("Login", Login);
		this.getGameInstance ().registerState ("CreateRoom", CreateRoom);
		this.getGameInstance ().registerState ("CreateRoom2", CreateRoom2);
		this.getGameInstance ().registerState ("JoinRoom", JoinRoom);
		this.getGameInstance ().registerState ("XMLScene", XMLScene);
		this.getGameInstance ().registerState ("ModeratorCharacterSelect", ModeratorCharacterSelect);
		this.getGameInstance ().registerState ("PlayerCharacterSelect", PlayerCharacterSelect);
		this.getGameInstance ().registerState ("PlayerIntro", PlayerIntro);
		this.getGameInstance ().registerState ("AudioTest", AudioTest);

		this.createBitmapFont (
			"Nunito",
			{
				fontFamily: "Nunito",
				fontSize: 60,
				strokeThickness: 0,
				fill: "0xffffff",         
			},
			{chars: this.getBitmapFontChars ()}
		);
		
		this.m_XApp.getXProjectManager ().pauseAllResourceManagers ();

		this.addTask ([
				XTask.WAIT, 0x0100,

				() => {
					this.m_XApp.getXProjectManager ().startResourceManagersByName (["default", "Common"]);
				},

				XTask.LABEL, "loopAssets",
					XTask.WAIT, 0x0100,

					XTask.FLAGS, (__task:XTask) => {
						__task.ifTrue (
							this.m_XApp.getXProjectManager ().getLoadCompleteByGroups (["Common"])
						);
					}, XTask.BNE, "loopAssets",

				() => { 
					this.m_XApp.getXProjectManager ().startAllResourceManagers ();

					this.getGameInstance ().gotoState ("Login");
				},

			XTask.RETN,
		]);

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
    }
	
//------------------------------------------------------------------------------------------
	public getGameInstanceClass ():any {
		return DATGameInstance;
	}

//------------------------------------------------------------------------------------------
}