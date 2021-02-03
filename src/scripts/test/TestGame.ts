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
import { OctopusBug } from './OctopusBug';
import { GUID } from '../../engine/utils/GUID';
import { FlockLeader } from './FlockLeader';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';
import * as SFS2X from "sfs2x-api";
import { SFSManager } from '../../engine/sfs/SFSManager';
import { XSpriteButton } from '../../engine/ui/XSpriteButton';
import { XTextButton } from '../../engine/ui/XTextButton';
import { XTextSpriteButton } from '../../engine/ui/XTextSpriteButton';
import { XTextSprite } from '../../engine/sprite/XTextSprite';
import { TextInput } from 'pixi-textinput-v5';
import { HBox } from '../../engine/ui/HBox';
import { VBox } from '../../engine/ui/VBox';
import { XJustify } from '../../engine/ui/XJustify';
import { Spacer } from '../../engine/ui/Spacer';
import { XMLBox } from '../../engine/ui/XMLBox';
import { G } from '../../engine/app/G';
import { ZoomMtg } from "@zoomus/websdk";

//------------------------------------------------------------------------------------------
export class TestGame extends XState {
	public static API_KEY:string = "Ji6MIz8SRCS8Kt82RMMcAA";
	public static API_SECRET:string = "raaof6SKBey7QeaWUacMyQhbG5QgDos4Y7wI";

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

		console.log (": guid: ", GUID.create ());

		//------------------------------------------------------------------------------------------
		ZoomMtg.preLoadWasm();
		ZoomMtg.prepareJssdk();

		//------------------------------------------------------------------------------------------
		var __leader:FlockLeader = world.addGameObject (FlockLeader, 0, 0.0, false) as FlockLeader;
		__leader.afterSetup ([]);

		//------------------------------------------------------------------------------------------
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

		//------------------------------------------------------------------------------------------
		var __hbox:HBox = this.addGameObjectAsChild (HBox, 0, 0.0, false) as HBox;
		__hbox.afterSetup ([2000, 100, XJustify.START, 0xc0c0c0]);
		__hbox.spacing = 15;
		
		//------------------------------------------------------------------------------------------
		var __meetingInputLabel:XTextSprite = this.createXTextSprite (
			-1,
			-1,
			"Meeting Number:",
			"Nunito",
			25,
			0x000000,
			true,
			"center", "center"
		);

		__hbox.addItem (__meetingInputLabel);
		__hbox.addSortableChild (__meetingInputLabel, 0, 0.0, false);
		__hbox.verticalPercent (__meetingInputLabel, 0.50);

		var __meetingNumberInput:TextInput = new TextInput (
			{
				input: {fontSize: '25px'}, 
				box: {fill: 0xe0e0e0},
			}
		);
		__hbox.addItem (__meetingNumberInput);
		__hbox.addSortableChild (__meetingNumberInput, 0, 0.0, false);
		__hbox.verticalPercent (__meetingNumberInput, 0.50);

		//------------------------------------------------------------------------------------------
		var __spacer:Spacer = __hbox.addGameObjectAsChild (Spacer, 0, 0.0, false) as Spacer;
		__spacer.afterSetup ([32, 25]);
		__hbox.addItem (__spacer);

		//------------------------------------------------------------------------------------------
		var __meetingPasswordLabel:XTextSprite = this.createXTextSprite (
			-1,
			-1,
			"Meeting Password:",
			"Nunito",
			25,
			0x000000,
			true,
			"center", "center"
		);
	
		__hbox.addItem (__meetingPasswordLabel);
		__hbox.addSortableChild (__meetingPasswordLabel, 0, 0.0, false);
		__hbox.verticalPercent (__meetingPasswordLabel, 0.50);
	
		var __meetingPasswordInput:TextInput = new TextInput (
			{
				input: {fontSize: '25px'}, 
				box: {fill: 0xe0e0e0},
			}
		);
		__hbox.addItem (__meetingPasswordInput);
		__hbox.addSortableChild (__meetingPasswordInput, 0, 0.0, false);
		__hbox.verticalPercent (__meetingPasswordInput, 0.50);

		//------------------------------------------------------------------------------------------
		var __spacer:Spacer = __hbox.addGameObjectAsChild (Spacer, 0, 0.0, false) as Spacer;
		__spacer.afterSetup ([32, 25]);
		__hbox.addItem (__spacer);

		//------------------------------------------------------------------------------------------
		var __joinButton:XTextSpriteButton = __hbox.addGameObjectAsChild (XTextSpriteButton, 0, 0.0, false) as XTextSpriteButton;
		__joinButton.afterSetup ([
			"StandardButton",
			true, 10, 150, 60,
			"JOIN",
			"Nunito",
			25,
			0x000000,
			0x000000,
			0x000000,
			0x000000,
			0x000000,
			false,
			"center", "center"
		]);
		__hbox.addItem (__joinButton);
		__hbox.verticalPercent (__joinButton, 0.50);

		__joinButton.addMouseUpListener (() => {
			this.joinMeeting ((__meetingNumberInput as any).text, (__meetingPasswordInput as any).text);
		});

		//------------------------------------------------------------------------------------------
		this.horizontalPercent (__hbox, 0.50);
		this.verticalPercent (__hbox, 0.15);

		return this;
	}

//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
	public joinMeeting (__meetingNumber:string, __meetingPassword:string):void {
		console.log (": join: ", __meetingNumber, __meetingPassword);

		/*
		const signature = ZoomMtg.generateSignature ({
			meetingNumber: __meetingNumber,
			apiKey: TestGame.API_KEY,
			apiSecret: TestGame.API_SECRET,
			role: "0",
			success: (res) => {
			console.log (": signature: ", res.result);
			}
		});
		*/
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