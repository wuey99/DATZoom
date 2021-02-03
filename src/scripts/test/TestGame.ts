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

//------------------------------------------------------------------------------------------
export class TestGame extends XState {

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

		/*
		SFSManager.instance ().setup ();

		SFSManager.instance ().connect (
			"127.0.0.1", 8080,
			(e:SFS2X.SFSEvent) => {
				console.log (": ----------------->: connected: ");
			},
			(e:SFS2X.SFSEvent) => {
				console.log (": ----------------->: disconnected: ");
			}
		);

		this.addTask ([
			XTask.LABEL, "loop",
				XTask.WAIT, 0x0100,

				XTask.FLAGS, (__task:XTask) => {
					__task.ifTrue (
						SFSManager.instance ().isConnected ()
					);
				}, XTask.BNE, "loop",

				() => {
					console.log (": connected: ");

					SFSManager.instance ().send (new SFS2X.LoginRequest("FozzieTheBear", "", null, "BasicExamples"));
					SFSManager.instance ().once (SFS2X.SFSEvent.LOGIN, (e:SFS2X.SFSEvent) => {
						console.log (": logged in: ", e);
					});
					SFSManager.instance ().once (SFS2X.LOGIN_ERROR, (e:SFS2X.SFSEvent) => {
						console.log (": login error: ", e);
					});
				},

				XTask.RETN,
		]);
		*/

		var __leader:FlockLeader = world.addGameObject (FlockLeader, 0, 0.0, false) as FlockLeader;
		__leader.afterSetup ([]);

		/*
		var __testButton:XSpriteButton = this.addGameObjectAsChild (XSpriteButton, 0, 0.0, false) as XSpriteButton;
		__testButton.afterSetup ([
			"StandardButton",
			true, 10, 250, 50
		]);
		this.horizontalPercent (__testButton, 0.50);
		__testButton.y = 256;
		*/

		this.createBitmapFont (
            "Aller",
            {
                fontFamily: "Nunito",
                fontSize: 60,
                strokeThickness: 0,
                fill: "0xffffff",         
            },
            {chars: this.getBitmapFontChars ()}
		);

		/*
		var __testButton2:XTextButton = this.addGameObjectAsChild (XTextButton, 0, 0.0, false) as XTextButton;
		__testButton2.afterSetup ([
			120,
			64,
			"press me",
			"Aller",
			100,
			0x0000ff,
			0xff0000,
			0x00ff00,
			0x0000ff,
			0x0000ff,
			false,
			"center", "center"
		]);
		__testButton2.x = 512;
		__testButton2.y = 512;
		
		var __testButton3:XTextSpriteButton = this.addGameObjectAsChild (XTextSpriteButton, 0, 0.0, false) as XTextSpriteButton;
		__testButton3.afterSetup ([
			"StandardButton",
			true, 10, 300, 100,
			"press me",
			"Aller",
			50,
			0x0000ff,
			0xff0000,
			0x00ff00,
			0x0000ff,
			0x0000ff,
			false,
			"center", "center"
		]);
		__testButton3.x = 2732/2;
		__testButton3.y = 512;

		var __textSprite:XTextSprite = this.createXTextSprite (
			120,
			64,
			"hello world",
			"Aller",
			100,
			0xff0000,
			true,
			"center", "center"
		);
		this.addSortableChild (__textSprite, 0, 0.0, true);
		__textSprite.x = 256;
		__textSprite.y = 256;

		var __textInput:TextInput = new TextInput (
			{
				input: {fontSize: '60px'}, 
				box: {fill: 0xEEEEEE}
			}
		);
		this.addSortableChild (__textInput, 0, 0.0, true);
		__textInput.x = 1024;
		__textInput.y = 768;
		*/

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

		var __xmlbox:XMLBox = this.addGameObjectAsChild (XMLBox, 0, 0.0, false) as XMLBox;
		__xmlbox.afterSetup ([
			1500, 1090, XJustify.NONE, 0xc0c0c0,
			"<XMLBox>\n\t<VBox x=\"50%\" y=\"50%\" width=\"1000\" height=\"500\" depth+=\"500\" justify=\"space-between\" fill=\"0xffa0a0\">\n\t\t<TextSpriteButton\n\t\t\tx=\"50%\"\n\t\t\tbuttonClassName=\"StandardButton\"\n\t\t\t9slice=\"true\"\n\t\t\t9width=\"200\"\n\t\t\t9height=\"50\"\n\t\t\ttext=\"hellew\"\n\t\t\tfontName=\"Nunito\"\n\t\t\tfontSize=\"30\"\n\t\t\tcolorNormal=\"0x000000\"\n\t\t\tcolorOver=\"0x00ff00\"\n\t\t\tcolorDown=\"0x0000ff\"\n\t\t\tcolorSelected=\"0xff0000\"\n\t\t\tcolorDisabled=\"0xc0c0c0\"\n\t\t\tbold=\"true\"\n\t\t\thorizontAlignment=\"center\"\n\t\t\tverticalAlignment=\"center\"\n\t\t/>\n\t\t<TextButton\n\t\t\tx=\"50%\"\n\t\t\twidth=\"200\"\n\t\t\theight=\"50\"\n\t\t\ttext=\"hellew\"\n\t\t\tfontName=\"Nunito\"\n\t\t\tfontSize=\"30\"\n\t\t\tcolorNormal=\"0x000000\"\n\t\t\tcolorOver=\"0x00ff00\"\n\t\t\tcolorDown=\"0x0000ff\"\n\t\t\tcolorSelected=\"0xff0000\"\n\t\t\tcolorDisabled=\"0xc0c0c0\"\n\t\t\tbold=\"true\"\n\t\t\thorizontAlignment=\"center\"\n\t\t\tverticalAlignment=\"center\"\n\t\t/>\n\t\t<SpriteButton\n\t\t\tx=\"50%\"\n\t\t\tbuttonClassName=\"TestButton\"\n\t\t\t9slice=\"true\"\n\t\t\t9width=\"200\"\n\t\t\t9height=\"50\"\n\t\t/>\n\t</VBox>\n\t<AnimatedSprite\n\t\tx=\"25%\" y=\"25%\"\n\t\tclassName=\"TestImage\"\n\t/>\n</XMLBox>\n"

		]);

		this.horizontalPercent (__xmlbox, 0.50);
		this.verticalPercent (__xmlbox, 0.50);

		return this;
	}

//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
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