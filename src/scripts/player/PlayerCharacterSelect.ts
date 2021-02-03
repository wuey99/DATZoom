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
import { XTextBox } from '../../engine/ui/XTextBox';
import { XTextSprite } from '../../engine/sprite/XTextSprite';
import { TextInput } from 'pixi-textinput-v5';
import { HBox } from '../../engine/ui/HBox';
import { VBox } from '../../engine/ui/VBox';
import { XJustify } from '../../engine/ui/XJustify';
import { XMLSprite } from '../../engine/ui/XMLSprite';
import { Spacer } from '../../engine/ui/Spacer';
import { ConnectionManager } from '../sfs/ConnectionManager';
import { XType } from '../../engine/type/XType';
import { G } from '../../engine/app/G';
import { DATState } from '../scene/DATState';
import { XMLScene } from '../scene/XMLScene';
import { XMLBox } from '../../engine/ui/XMLBox';
import { MessagingManager } from '../sfs/MessagingManager';
import { Resource } from '../../engine/resource/Resource';
import { XPoint } from '../../engine/geom/XPoint';

//------------------------------------------------------------------------------------------
export class PlayerCharacterSelect extends XMLScene {
	public script:XTask;

	public m_character:string;

    public m_selectTalismanLayout:VBox;

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

        this.script = this.addEmptyTask ();
        
		this.m_character = this.m_params.getUtfString ("character");

		console.log (": character: ", this.m_character);

		this.createStatusMessage ();

		this.setStatusMessage ("Click on your talisman.");
		this.verticalPercent (this.m_statusMessage, 0.10);

		this.SelectTalisman_Script ();

		this.setupSceneChangeListener ();

		MessagingManager.instance ().fireReadySignal (MessagingManager.MODERATOR);

		return this;
	}

//------------------------------------------------------------------------------------------
	public cleanup ():void {
		super.cleanup ();
    }
    
//------------------------------------------------------------------------------------------
	public Idle_Script ():void {
		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.WAIT1000, 1 * 1000,

					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,

					XTask.RETN,
				]);	
			},
				
			//------------------------------------------------------------------------------------------
			// animation
			//------------------------------------------------------------------------------------------	
			XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,
					
				XTask.GOTO, "loop",
				
			XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
		]);
			
	//------------------------------------------------------------------------------------------
	}

	//------------------------------------------------------------------------------------------
	public SelectTalisman_Script ():void {
		var __mainLayout:VBox = this.m_selectTalismanLayout = this.addGameObjectAsChild (VBox, this.getLayer (), this.getDepth (), false) as VBox;
		__mainLayout.afterSetup ([3000, 2000, XJustify.CENTER, 0x40e0e0]);
		__mainLayout.spacing = 32;

		//------------------------------------------------------------------------------------------
		var __button:XSpriteButton;
		
		//------------------------------------------------------------------------------------------
        var __topRowLayout:HBox = __mainLayout.addGameObjectAsChild (HBox, this.getLayer (), this.getDepth (), false) as HBox;
        __topRowLayout.afterSetup ([2300, 724, XJustify.SPACE_BETWEEN, 0xa0a0a0]);

		__button = __topRowLayout.addGameObjectAsChild (XSpriteButton, this.getLayer (), this.getDepth (), false) as XSpriteButton;
		__button.afterSetup ([
			"Talisman_PlayingCards",
			false, 0, 0, 0
        ]);
		__topRowLayout.addItem (__button);
		__button.setDisabled (this.m_character != "Aggie");
        __button.addMouseUpListener (this.onComplete.bind (this));

		__button = __topRowLayout.addGameObjectAsChild (XSpriteButton, this.getLayer (), this.getDepth (), false) as XSpriteButton;
		__button.afterSetup ([
			"Talisman_Journal",
			false, 0, 0, 0
        ]);
		__topRowLayout.addItem (__button);
		__button.setDisabled (this.m_character != "Isaac");
        __button.addMouseUpListener (this.onComplete.bind (this));

		__button = __topRowLayout.addGameObjectAsChild (XSpriteButton, this.getLayer (), this.getDepth (), false) as XSpriteButton;
		__button.afterSetup ([
			"Talisman_Keys",
			false, 0, 0, 0
        ]);
		__topRowLayout.addItem (__button);
		__button.setDisabled (this.m_character != "Goodwin");
        __button.addMouseUpListener (this.onComplete.bind (this));

        //------------------------------------------------------------------------------------------
        __mainLayout.addItem (__topRowLayout);
		
		__mainLayout.horizontalPercent (__topRowLayout, 0.50);

		//------------------------------------------------------------------------------------------
        var __botRowLayout:HBox = __mainLayout.addGameObjectAsChild (HBox, this.getLayer (), this.getDepth (), false) as HBox;
        __botRowLayout.afterSetup ([2300, 724, XJustify.SPACE_BETWEEN, 0xa0a0a0]);

		__button = __botRowLayout.addGameObjectAsChild (XSpriteButton, this.getLayer (), this.getDepth (), false) as XSpriteButton;
		__button.afterSetup ([
			"Talisman_Book",
			false, 0, 0, 0
        ]);
        __botRowLayout.addItem (__button);
		__button.setDisabled (this.m_character != "Calloway");
        __button.addMouseUpListener (this.onComplete.bind (this));

		__button = __botRowLayout.addGameObjectAsChild (XSpriteButton, this.getLayer (), this.getDepth (), false) as XSpriteButton;
		__button.afterSetup ([
			"Talisman_Glass",
			false, 0, 0, 0
        ]);
		__botRowLayout.addItem (__button);
		__button.setDisabled (this.m_character != "Grace");
        __button.addMouseUpListener (this.onComplete.bind (this));

		__button = __botRowLayout.addGameObjectAsChild (XSpriteButton, this.getLayer (), this.getDepth (), false) as XSpriteButton;
		__button.afterSetup ([
			"Talisman_Spoon",
			false, 0, 0, 0
        ]);
		__botRowLayout.addItem (__button);
		__button.setDisabled (this.m_character != "Marcel");
        __button.addMouseUpListener (this.onComplete.bind (this));

        //------------------------------------------------------------------------------------------
        __mainLayout.addItem (__botRowLayout);
		
		__mainLayout.horizontalPercent (__botRowLayout, 0.50);

 		//------------------------------------------------------------------------------------------
		this.horizontalPercent (__mainLayout, 0.50);
        this.verticalPercent (__mainLayout, 0.50);
        
        //------------------------------------------------------------------------------------------
		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.WAIT1000, 1 * 1000,

					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,

					XTask.RETN,
				]);	
			},
				
			//------------------------------------------------------------------------------------------
			// animation
			//------------------------------------------------------------------------------------------	
			XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,
					
				XTask.GOTO, "loop",
				
			XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
		]);
			
	//------------------------------------------------------------------------------------------
	}

//------------------------------------------------------------------------------------------
    public onComplete ():void {
        MessagingManager.instance ().fireTriggerSignal (MessagingManager.MODERATOR, "ready", {});

        this.m_selectTalismanLayout.nukeLater ();

        this.Wait_Script ();
    }

//------------------------------------------------------------------------------------------
    public Wait_Script ():void {
		this.setStatusMessage ("Please wait for the other spirits to arrive...");
        this.verticalPercent (this.m_statusMessage, 0.50);
        
        this.script.gotoTask ([
                
            //------------------------------------------------------------------------------------------
            // control
            //------------------------------------------------------------------------------------------
            () => {
                this.script.addTask ([
                    XTask.WAIT1000, 1 * 1000,

                    XTask.LABEL, "loop",
                        XTask.WAIT, 0x0100,

                    XTask.RETN,
                ]);	
            },
                
            //------------------------------------------------------------------------------------------
            // animation
            //------------------------------------------------------------------------------------------	
            XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,
                    
                XTask.GOTO, "loop",
                
            XTask.RETN,
                
            //------------------------------------------------------------------------------------------			
        ]);
            
    //------------------------------------------------------------------------------------------
    }

//------------------------------------------------------------------------------------------
}