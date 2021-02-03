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
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { XState } from '../../engine/state/XState';
import { GUID } from '../../engine/utils/GUID';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';
import * as SFS2X from "sfs2x-api";
import { SFSManager } from '../../engine/sfs/SFSManager';
import { XSpriteButton } from '../../engine/ui/XSpriteButton';
import { XTextButton } from '../../engine/ui/XTextButton';
import { XTextSpriteButton } from '../../engine/ui/XTextSpriteButton';
import { XTextGameObject } from '../../engine/ui/XTextGameObject';
import { XTextSprite } from '../../engine/sprite/XTextSprite';
import { TextInput } from 'pixi-textinput-v5';
import { ConnectionManager } from '../sfs/ConnectionManager';
import { XType } from '../../engine/type/XType';
import { G } from '../../engine/app/G';
import { MessagingManager } from '../sfs/MessagingManager';
import { MessagingSubManager } from '../sfs/MessagingSubManager';

//------------------------------------------------------------------------------------------
export class DATState extends XState {
	public m_statusMessage:XTextGameObject;

	public script:XTask;

	public m_messagingSubManager:MessagingSubManager;

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

		this.m_messagingSubManager = new MessagingSubManager ();

		return this;
	}

//------------------------------------------------------------------------------------------
	public cleanup ():void {
		super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
	public setupSceneChangeListener ():void {
		this.m_messagingSubManager.addSceneChangeListener (
			MessagingManager.instance ().getModeratorID (),
			(__stateName:string, __xmlBoxString:string, __params:SFS2X.SFSObject) => {
				console.log (": all joined: ", __stateName, __stateName == "", __xmlBoxString, __params);

				__stateName = (__stateName == "" ? "XMLScene" : __stateName);

				this.getGameInstance ().gotoState (__stateName, [__xmlBoxString, __params]);
			}
		);
	}

//------------------------------------------------------------------------------------------
	public waitForAllPlayers ():boolean {
		var __userList:Array<SFS2X.SFSUser> = ConnectionManager.instance ().getSFSUserManager ().getUserList ();
		var __user:SFS2X.SFSuser;
		var i:number = 0;

		for (__user of __userList) {
			if (!__user.name.startsWith ("moderator:")) {
				i++;
			}
		}

		return true;
	}

//------------------------------------------------------------------------------------------
	public createStatusMessage ():void {
		this.m_statusMessage = this.addGameObjectAsChild (XTextGameObject, 0, 0.0) as XTextGameObject;
		this.m_statusMessage.afterSetup ([
			-1,
			64,
			"",
			"Nunito",
			75,
			0x0000ff,
			true,
			"center", "center"
		]);

		this.horizontalPercent (this.m_statusMessage, 0.50);
		this.verticalPercent (this.m_statusMessage, 0.125);
	}

	//------------------------------------------------------------------------------------------
	public setStatusMessage (__text:string):void {
		this.m_statusMessage.text = __text;

		this.horizontalPercent (this.m_statusMessage, 0.50);
	}

//------------------------------------------------------------------------------------------
	public getActualWidth ():number {
		return G.SCREEN_WIDTH;
	}

//------------------------------------------------------------------------------------------
	public getActualHeight ():number {
		return G.SCREEN_HEIGHT;
	}

//------------------------------------------------------------------------------------------
}