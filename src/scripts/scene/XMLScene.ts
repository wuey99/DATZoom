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
import { XTextSprite } from '../../engine/sprite/XTextSprite';
import { TextInput } from 'pixi-textinput-v5';
import { HBox } from '../../engine/ui/HBox';
import { VBox } from '../../engine/ui/VBox';
import { XJustify } from '../../engine/ui/XJustify';
import { Spacer } from '../../engine/ui/Spacer';
import { ConnectionManager } from '../sfs/ConnectionManager';
import { XType } from '../../engine/type/XType';
import { G } from '../../engine/app/G';
import { DATState } from './DATState';
import { XMLBox } from '../../engine/ui/XMLBox';
import { MessagingManager } from '../sfs/MessagingManager';
import { MessagingSubManager } from '../sfs/MessagingSubManager';

//------------------------------------------------------------------------------------------
export class XMLScene extends DATState {
	public script:XTask;

	public m_xmlBox:XSimpleXMLNode;
	public m_params:SFS2X.SFSObject;

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

		var __xmlString:string = __params[this.m_paramIndex++];
		this.m_params = __params[this.m_paramIndex++];
		
		console.log (": xmlString: ", __xmlString);

		if (__xmlString != "") {
			var __xmlbox:XMLBox = this.addGameObjectAsChild (XMLBox, 0, 0.0, false) as XMLBox;
			__xmlbox.afterSetup ([
				1500, 1090, XJustify.NONE, 0xc0c0c0,
				__xmlString
			]);

			this.horizontalPercent (__xmlbox, 0.50);
			this.verticalPercent (__xmlbox, 0.50);
		}

		this.setupSceneChangeListener ();

		MessagingManager.instance ().fireReadySignal (MessagingManager.MODERATOR);

		this.m_messagingSubManager.addTriggerListener (
			MessagingManager.instance ().getModeratorID (),
			"PLAY-SOUND",
			(__params:SFS2X.SFSObject) => {
				this.world.getMusicSoundManager ().removeAllSounds ();

				this.world.getMusicSoundManager ().playSoundFromName (__params.getUtfString ("name"),
					1.0, 0.0, 0.33,
					() => {
						console.log (": BGM: start: ");
					},
					() => {
						console.log (": BGM: end: ");
					}
				);
				
				console.log (": triggered: PLAY-SOUND: ", __params.getUtfString ("name"));
			}
		);

		this.m_messagingSubManager.addTriggerListener (
			MessagingManager.instance ().getModeratorID (),
			"STOP-SOUND",
			(__params:SFS2X.SFSObject) => {
				this.world.getMusicSoundManager ().removeAllSounds ();
				
				console.log (": triggered: STOP-SOUND: ", __params.getUtfString ("name"));
			}
		);

		return this;
	}

//------------------------------------------------------------------------------------------
	public cleanup ():void {
		super.cleanup ();

		this.m_messagingSubManager.cleanup ();
    }
    
//------------------------------------------------------------------------------------------
}