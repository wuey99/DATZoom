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
import { XTextGameObject } from '../../engine/ui/XTextGameObject';
import { XTextBox } from '../../engine/ui/XTextBox';
import { TextInput } from 'pixi-textinput-v5';
import { ConnectionManager } from '../sfs/ConnectionManager';
import { XType } from '../../engine/type/XType';
import { G } from '../../engine/app/G';
import { DATState } from '../scene/DATState';
import { HBox } from '../../engine/ui/HBox';
import { VBox } from '../../engine/ui/VBox';
import { XJustify } from '../../engine/ui/XJustify';
import { Spacer } from '../../engine/ui/Spacer';
import { FlockLeader } from '../test/FlockLeader';
import { MessagingManager } from '../sfs/MessagingManager';
import { MessagingSubManager } from '../sfs/MessagingSubManager';
import { UserList } from '../components/UserList';

//------------------------------------------------------------------------------------------
export class CreateRoom2 extends DATState {
	public m_createRoomButton:XTextSpriteButton;
	public script:XTask;
	public m_createRoomLayout:HBox;
    public m_roomIDText:any;
	public m_userListLayout:UserList;
	public m_userReadyListLayout:VBox;
    public m_talismanListLayout:VBox;
    public m_mainUserLayout:HBox;
    public m_continueButton:XTextSpriteButton;
    public m_allPlayersReady:boolean;

	public static NUM_PLAYERS:number = 2;
	
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

		this.createStatusMessage ();

        this.CreateRoom_Script ();
        
		SFSManager.instance ().addEventListener (SFS2X.SFSEvent.USER_ENTER_ROOM, (e:SFS2X.SFSEvent) => {
			console.log (": userEnteredRoom: ", e);
		});

		return this;
	}

//------------------------------------------------------------------------------------------
	public cleanup ():void {
		super.cleanup ();
		
		this.m_messagingSubManager.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
	public CreateRoom_Script ():void {
		this.setStatusMessage ("Create Room");

		var __hbox:HBox = this.m_createRoomLayout = this.addGameObjectAsChild (HBox, 0, 0.0, false) as HBox;
        __hbox.afterSetup ([1500, 100, XJustify.SPACE_BETWEEN, -1]);

		var __createButton:XTextSpriteButton = this.m_createRoomButton = __hbox.addGameObjectAsChild (XTextSpriteButton, 0, 0.0, false) as XTextSpriteButton;
		__createButton.afterSetup ([
			"StandardButton",
			true, 10, 225, 60,
			"CREATE ROOM",
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
        __hbox.addItem (__createButton);
        
		this.m_createRoomButton.addMouseUpListener (() => {
			console.log (": mouse up: ");

			this.m_createRoomButton.setDisabled (true);

			this.createRoom ();
        });
        
        var __roomIDText:any = this.m_roomIDText =  new TextInput (
            {
                input: {
                    fontSize: '40px'
                }, 
                box: {fill: 0xc0c0c0},
            }
        );

        __roomIDText.text = "xyzzy"; // __roomID;

        __hbox.addItem (__roomIDText);
        __hbox.addSortableChild (__roomIDText, 0, 0.0, false);

		this.horizontalPercent (this.m_createRoomLayout, 0.50);
        this.verticalPercent (this.m_createRoomLayout, 0.25);
        
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
    public createRoom ():void {
        var __roomID:string = GUID.create ().substring (1, 18);

        var __settings:SFS2X.RoomSettings = new SFS2X.RoomSettings (__roomID);
        __settings.maxUsers = CreateRoom2.NUM_PLAYERS + 1; // + Moderator
        __settings.groupId = "default";

        SFSManager.instance ().once (SFS2X.SFSEvent.ROOM_ADD, (e:SFS2X.SFSEvent) => {
            console.log (": onRoomAdded: ", e);

            this.m_roomIDText.text = __roomID;

            ConnectionManager.instance ().JoinRoom_Script (__roomID);

            this.WaitForAllToJoin_Script ();
        });

        SFSManager.instance ().once (SFS2X.SFSEvent.ROOM_CREATION_ERROR, (e:SFS2X.SFSEvent) => {
            console.log (": onRoomCreationError: ", e);
        });

        SFSManager.instance ().send (new SFS2X.CreateRoomRequest (__settings));
    }

//------------------------------------------------------------------------------------------
    public setupUserList (__mainLayout:HBox):void {
        var __userListLayout:UserList = this.m_userListLayout = __mainLayout.addGameObjectAsChild (
            UserList,
            this.getLayer (), this.getDepth (), false
        ) as UserList;

        __userListLayout.afterSetup ([
            2000 * 0.50, 1000, XJustify.START, -1,
            ConnectionManager.instance ().getSFSUserManager ().getUserList (),
            "Nunito",
            30,
            0x000000,
            "left",
            0.0,
            32
        ]);
        __userListLayout.spacing = 32;

        __mainLayout.addItem (__userListLayout);
    }

	//------------------------------------------------------------------------------------------
	public collectUsers (__userMap:Map<SFS2X.SFSUser, number>, __userList:Array<SFS2X.SFSUser>):void {
		var __user:SFS2X.SFSUser;

		for (__user of __userList) {
			__userMap.set (__user, 0);
		}
	}

	//------------------------------------------------------------------------------------------
	public updateJoinedUsers (__userMap:Map<SFS2X.SFSUser, number>):void {
		this.m_userListLayout.updateList ([
			1000, 200, XJustify.START, -1,
			Array.from (__userMap.keys ()),
			"Nunito",
			30,
			0x000000,
			"left",
			0.0,
			32
		]);
	}

    //------------------------------------------------------------------------------------------
    public setupMainUserLayout ():void {
		var __mainLayout:HBox = this.m_mainUserLayout = this.addGameObjectAsChild (
            HBox,
            this.getLayer (), this.getDepth (), false
        ) as HBox;

		__mainLayout.afterSetup ([2000, 750, XJustify.START, 0x40e0e0]);
		__mainLayout.spacing = 32;

		//------------------------------------------------------------------------------------------
		// user list
		//------------------------------------------------------------------------------------------
		this.setupUserList (__mainLayout);

		//------------------------------------------------------------------------------------------
		// user ready list
		//------------------------------------------------------------------------------------------
		// this.setupUserReadyList (__mainLayout);

		//------------------------------------------------------------------------------------------
		// talisman list
		//------------------------------------------------------------------------------------------
		// this.setupTalismanList (__mainLayout);

		//------------------------------------------------------------------------------------------
		this.horizontalPercent (__mainLayout, 0.50);
		this.verticalPercent (__mainLayout, 0.66);
    }

	//------------------------------------------------------------------------------------------
	public WaitForAllToJoin_Script ():void {

        this.setupMainUserLayout ();

        //------------------------------------------------------------------------------------------
		var __userList:Array<SFS2X.SFSUser>;
		var __userMap:Map<SFS2X.SFSUser, number> = new Map<SFS2X.SFSUser, number> ();

        //------------------------------------------------------------------------------------------
		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
						XTask.WAIT1000, 1 * 1000,

						XTask.FLAGS, (__task:XTask) => {
							__userList = ConnectionManager.instance ().getPlayerUserList ();

							console.log (": users: ", __userMap, __userMap.size);

							this.collectUsers (__userMap, __userList);

							this.updateJoinedUsers (__userMap);

							__task.ifTrue (__userMap.size == CreateRoom2.NUM_PLAYERS);
						}, XTask.BNE, "loop",

						() => {
							this.WaitToStart_Script ();
                        },
                        
						XTask.GOTO, "loop",

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
	public WaitToStart_Script ():void {
		var __started:boolean = false;

		var __startButton:XTextSpriteButton = this.addGameObjectAsChild (XTextSpriteButton, 0, 0.0, false) as XTextSpriteButton;
		__startButton.afterSetup ([
			"StandardButton",
			true, 10, 300, 60,
			"START GAME",
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

		this.horizontalPercent (__startButton, 0.50);
        this.verticalPercent (__startButton, 0.95);
        
		__startButton.addMouseUpListener (() => {
			__startButton.nukeLater ();

			__started = true;
	
			MessagingManager.instance ().fireSceneChangeSignal (
				MessagingManager.ALL_PLAYERS,
				"",
				"<XMLBox>\n\t<VBox x=\"50%\" y=\"50%\" width=\"1000\" height=\"500\" depth+=\"500\" justify=\"space-between\" fill=\"0xffa0a0\">\n\t\t<TextSpriteButton\n\t\t\tx=\"50%\"\n\t\t\tbuttonClassName=\"StandardButton\"\n\t\t\t9slice=\"true\"\n\t\t\t9width=\"200\"\n\t\t\t9height=\"50\"\n\t\t\ttext=\"hellew\"\n\t\t\tfontName=\"Nunito\"\n\t\t\tfontSize=\"30\"\n\t\t\tcolorNormal=\"0x000000\"\n\t\t\tcolorOver=\"0x00ff00\"\n\t\t\tcolorDown=\"0x0000ff\"\n\t\t\tcolorSelected=\"0xff0000\"\n\t\t\tcolorDisabled=\"0xc0c0c0\"\n\t\t\tbold=\"true\"\n\t\t\thorizontAlignment=\"center\"\n\t\t\tverticalAlignment=\"center\"\n\t\t/>\n\t\t<TextButton\n\t\t\tx=\"50%\"\n\t\t\twidth=\"200\"\n\t\t\theight=\"50\"\n\t\t\ttext=\"hellew\"\n\t\t\tfontName=\"Nunito\"\n\t\t\tfontSize=\"30\"\n\t\t\tcolorNormal=\"0x000000\"\n\t\t\tcolorOver=\"0x00ff00\"\n\t\t\tcolorDown=\"0x0000ff\"\n\t\t\tcolorSelected=\"0xff0000\"\n\t\t\tcolorDisabled=\"0xc0c0c0\"\n\t\t\tbold=\"true\"\n\t\t\thorizontAlignment=\"center\"\n\t\t\tverticalAlignment=\"center\"\n\t\t/>\n\t\t<SpriteButton\n\t\t\tx=\"50%\"\n\t\t\tbuttonClassName=\"TestButton\"\n\t\t\t9slice=\"true\"\n\t\t\t9width=\"200\"\n\t\t\t9height=\"50\"\n\t\t/>\n\t</VBox>\n\t<AnimatedSprite\n\t\tx=\"25%\" y=\"25%\"\n\t\tclassName=\"TestImage\"\n\t/>\n</XMLBox>\n"
			);
		});

		//------------------------------------------------------------------------------------------
		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,

						XTask.FLAGS, (__task:XTask) => {
							__task.ifTrue (__started);
						}, XTask.BNE, "loop",

						() => {
							this.WaitForAllPlayersReady_Script ();
						},

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
	public WaitForAllPlayersReady_Script ():void {
		var __userList:Array<SFS2X.SFSUser> = ConnectionManager.instance ().getSFSUserManager ().getUserList ();

		var __readyUserCount:number = 0;
		var __totalUserCount:number = 0;

		var __user:SFS2X.SFSUser;

		for (__user of __userList) {
			if (!__user.isItMe) {
				this.m_messagingSubManager.addReadyListener (__user.id, () => {
					console.log (": user ready: ", __user);

					__readyUserCount++;
				});

				__totalUserCount++;
			}
		}

		//------------------------------------------------------------------------------------------
		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,

						XTask.FLAGS, (__task:XTask) => {
							__task.ifTrue (__readyUserCount == __totalUserCount);
						}, XTask.BNE, "loop",

						() => {
							this.ArrangeCharacters_Script ();
						},

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
    public firePlayersCharacterSelect ():void {
        var __userList:Array<SFS2X.SFSUser> = ConnectionManager.instance ().getSFSUserManager ().getUserList ();
        var __user:SFS2X.SFSuser;
        var i:number = 0;

        for (__user of __userList) {
            if (!__user.name.startsWith ("moderator:")) {
                var __talismanLabel:__DraggableXTextBox = (this.m_talismanListLayout.getItems ()[i] as __DraggableXTextBox);
                console.log (": userName: ", __user.name, __user.id, __talismanLabel.text);

                var __character:string = __talismanLabel.text;

                MessagingManager.instance ().fireSceneChangeSignal (
                    __user.id,
                    "PlayerCharacterSelect",
                    "",
                    {
                        character: __character
                    }
                );

                i++;
            }
        }
    }

//------------------------------------------------------------------------------------------
    public ArrangeCharacters_Script ():void {   
        this.setStatusMessage ("Select characters for each player.");
        this.verticalPercent (this.m_statusMessage, 0.10);

        //------------------------------------------------------------------------------------------
        // user list
        //------------------------------------------------------------------------------------------
        // this.setupUserList (__mainLayout);

        //------------------------------------------------------------------------------------------
        // user ready list
        //------------------------------------------------------------------------------------------
        this.setupUserReadyList (this.m_mainUserLayout);

        //------------------------------------------------------------------------------------------
        // destination talisman list
        //------------------------------------------------------------------------------------------
        this.setupDestTalismanList (this.m_mainUserLayout);

        //------------------------------------------------------------------------------------------
        this.horizontalPercent (this.m_mainUserLayout, 0.50);
        this.verticalPercent (this.m_mainUserLayout, 0.50);

        //------------------------------------------------------------------------------------------
        var __continueButton:XTextSpriteButton = this.m_continueButton = this.addGameObjectAsChild (XTextSpriteButton, 0, 0.0, false) as XTextSpriteButton;
        __continueButton.afterSetup ([
            "StandardButton",
            true, 10, 150, 60,
            "NEXT",
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

        this.horizontalPercent (__continueButton, 0.50);
        this.verticalPercent (__continueButton, 0.95);

        var __id:number = __continueButton.addMouseUpListener (() => {
            __continueButton.removeMouseUpListener (__id);

            __continueButton.setDisabled (true);
            
            this.firePlayersCharacterSelect ();

            this.WaitForSpirits_Script ();
        });
        
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
    }

//------------------------------------------------------------------------------------------
    public setupUserReadyList (__mainLayout:HBox):void {
        var __userReadyListLayout:VBox = this.m_userReadyListLayout =__mainLayout.addGameObjectAsChild (VBox, this.getLayer (), this.getDepth (), false) as VBox;
        __userReadyListLayout.afterSetup ([2000 * 0.15, 1000, XJustify.START, -1]);
        __userReadyListLayout.spacing = 32;
        __mainLayout.addItem (__userReadyListLayout);

        var __userList:Array<SFS2X.SFSUser> = ConnectionManager.instance ().getSFSUserManager ().getUserList ();

        var __totalReady:number = 0;

        XType.ofEach (__userList,
            (__user:SFS2X.SFSUser) => {
                if (!__user.name.startsWith ("moderator:")) {
                    var __userLabel:XTextSprite = this.createXTextSprite (
                        1500 * 0.15,
                        -1,
                        "",
                        "Nunito",
                        30,
                        0x000000,
                        true,
                        "center", "center"
                    );

                    __userReadyListLayout.addItem (__userLabel);
                    __userReadyListLayout.addSortableChild (__userLabel, this.getLayer (), this.getDepth (), false);
                    __userReadyListLayout.horizontalPercent (__userLabel, 0.0);
                };

                this.m_messagingSubManager.addTriggerListener (__user.id, "ready", () => {
                    __totalReady++;
                    
                    console.log (": talisman selected: ", __user.id, __user.name);
                    
                    __userLabel.text = "Ready";

                    if (__totalReady == __userList.length - 1) {
                        this.m_allPlayersReady = true;
                    }
                })
            }
        );

        // __mainLayout.horizontalPercent (__userReadyListLayout, 0.50);
    }

//------------------------------------------------------------------------------------------
    public setupDestTalismanList (__mainLayout:HBox):void {
        var __talismanListLayout:VBox = this.m_talismanListLayout = __mainLayout.addGameObjectAsChild (VBox, this.getLayer (), this.getDepth (), false) as VBox;
        __talismanListLayout.afterSetup ([2000 * 0.35, 1000, XJustify.START, -1]);
        __talismanListLayout.spacing = 32;
        __mainLayout.addItem (__talismanListLayout);

        var __talismanList:Array<string> = [
            "",
            "",
            "",
            "",
            "",
            "",
        ];

        var __talismanListLayoutParams:any = {
            spacing: 0,
            height: 0
        }

        XType.ofEach (__talismanList,
            (__talisman:string) => {
                var __talismanLabel:XTextBox = __talismanListLayout.addGameObjectAsChild (
                    XTextBox, this.getLayer (), this.getDepth (), false
                ) as XTextBox;

                __talismanLabel.afterSetup ([
                    300, 30, 0x8080ff,
                    -1,
                    -1,
                    __talisman,
                    "Nunito",
                    25,
                    0x000000,
                    true,
                    "center", "center"
                ]);

                __talismanListLayout.addItem (__talismanLabel);
                __talismanListLayout.addSortableChild (__talismanLabel, this.getLayer (), this.getDepth (), false);

                __talismanListLayout.horizontalPercent (__talismanLabel, 0.50);
            }
        );

        var __items:Array<PIXI.Sprite | TextInput> = __talismanListLayout.getItems ();
        var __item:PIXI.Sprite | TextInput = __items[__items.length - 1];
        __talismanListLayoutParams.spacing = __items[1].y - __items[0].y;
        __talismanListLayoutParams.height = __item.y;

        // __mainLayout.horizontalPercent (__talismanListLayout, 1.0);
    }

//------------------------------------------------------------------------------------------
    public setupSourceTalismanList (__mainLayout:HBox):void {
        var __talismanListLayout:VBox = this.m_talismanListLayout = __mainLayout.addGameObjectAsChild (VBox, this.getLayer (), this.getDepth (), false) as VBox;
        __talismanListLayout.afterSetup ([2000 * 0.35, 1000, XJustify.START, -1]);
        __talismanListLayout.spacing = 32;
        __mainLayout.addItem (__talismanListLayout);

        var __talismanList:Array<string> = [
            "Aggie",
            "Calloway",
            "Goodwin",
            "Grace",
            "Isaac",
            "Marcel",
        ];

        var __talismanListLayoutParams:any = {
            spacing: 0,
            height: 0
        }

        XType.ofEach (__talismanList,
            (__talisman:string) => {
                var __talismanLabel:__DraggableXTextBox = __talismanListLayout.addGameObjectAsChild (
                    __DraggableXTextBox, this.getLayer (), this.getDepth (), false
                ) as __DraggableXTextBox;

                __talismanLabel.afterSetup ([
                    300, 30, 0xff8080,
                    -1,
                    -1,
                    __talisman,
                    "Nunito",
                    25,
                    0x000000,
                    true,
                    "center", "center"
                ]);

                __talismanListLayout.addItem (__talismanLabel);

                __talismanListLayout.horizontalPercent (__talismanLabel, 0.50);

                this.__sourceTalismanLabelDragHandler (__talisman, __talismanListLayoutParams, __talismanListLayout, __talismanLabel);
            }
        );

        var __items:Array<PIXI.Sprite | TextInput> = __talismanListLayout.getItems ();
        var __item:PIXI.Sprite | TextInput = __items[__items.length - 1];
        __talismanListLayoutParams.spacing = __items[1].y - __items[0].y;
        __talismanListLayoutParams.height = __item.y;

        // __mainLayout.horizontalPercent (__talismanListLayout, 1.0);
    }

//------------------------------------------------------------------------------------------
    public __sourceTalismanLabelDragHandler (__talisman:string, __talismanListLayoutParams:any, __talismanListLayout:VBox, __talismanLabel:__DraggableXTextBox):void {
        var __mouseDownPos:PIXI.Point = new PIXI.Point ();
        var __basePos:PIXI.Point = new PIXI.Point ();
        var __itemIndex:number = __talismanListLayout.getIndexByItem (__talismanLabel);

        __talismanLabel.addMouseDownListener ((__gameObject:__DraggableXTextBox, e:PIXI.InteractionEvent) => {
            console.log (": ", __talisman, __talismanListLayout.getIndexByItem (__talismanLabel));	

            __itemIndex = __talismanListLayout.getIndexByItem (__talismanLabel);

            e.data.getLocalPosition (__talismanListLayout, __mouseDownPos, e.data.global);

            __basePos.x = __talismanLabel.x;
            __basePos.y = __talismanLabel.y;
        });

        __talismanLabel.addMouseMoveListener ((__gameObject:__DraggableXTextBox, e:PIXI.InteractionEvent) => {
            __itemIndex = __talismanListLayout.getIndexByItem (__talismanLabel);
            
            var __point:PIXI.Point = new PIXI.Point ();

            e.data.getLocalPosition (__talismanListLayout, __point, e.data.global);

            var __dx:number = (__point.x - __mouseDownPos.x);
            var __dy:number = (__point.y - __mouseDownPos.y);

            var __x:number = __basePos.x + __dx;
            var __y:number = __basePos.y + __dy;

            __talismanLabel.x = __x;
            __talismanLabel.y = __y;

            return;

            var __y:number = __basePos.y + __dy;
            __y = Math.max (0, __y);
            __y = Math.min (__talismanListLayoutParams.height, __y);
            __y = Math.floor ((__y + __talismanListLayoutParams.spacing / 2) / __talismanListLayoutParams.spacing) * __talismanListLayoutParams.spacing;
            __talismanLabel.y = __y;

            var __items:Array<PIXI.Sprite | TextInput> = __talismanListLayout.getItems ();

            var __moveItemBackward = (__targetIndex:number) => {
                var i:number;

                for (i = __itemIndex - 1; i >= __targetIndex; i--) {
                    __items[i].y += __talismanListLayoutParams.spacing;

                    __items[i + 1] = __items[i];
                }

                __items[__targetIndex] = __talismanLabel;

                __itemIndex = __targetIndex;
            }
            
            var __moveItemForward = (__targetIndex:number) => {
                var i:number;
                
                for (i = __itemIndex + 1; i <= __targetIndex; i++) {
                    __items[i].y -= __talismanListLayoutParams.spacing;

                    __items[i - 1] = __items[i];
                }

                __items[__targetIndex] = __talismanLabel;

                __itemIndex = __targetIndex;
            }

            var __item:PIXI.Sprite | TextInput;
            var i:number;

            for (i = 0; i < __items.length; i++) {
                __item = __items[i];

                if (__item != __talismanLabel) {
                    if (__item.y == __talismanLabel.y) {
                        console.log (": ", (__item as __DraggableXTextBox).text, __itemIndex, i);

                        if (__itemIndex > i) {
                            __moveItemBackward (i); break;
                        }

                        if (__itemIndex < i) {
                            __moveItemForward (i); break;
                        }
                    }
                }
            }
        });
    }

	//------------------------------------------------------------------------------------------
	public WaitForSpirits_Script ():void {
        this.setStatusMessage ("Please wait for the spirits to arrive.");
            
        XType.ofEach (this.m_userReadyListLayout.getItems (),
            (__userLabel:XTextSprite) => {
                __userLabel.text = "Waiting for";
            }
        );

    //------------------------------------------------------------------------------------------
		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
                    XTask.LABEL, "loop",
                        XTask.WAIT, 0x0100,
                            
                        XTask.FLAGS, (__task:XTask) =>{
                            __task.ifTrue (this.m_allPlayersReady);
                        }, XTask.BNE, "loop",

                    () => {
                        this.AllPlayersReady_Script ();
                    },

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
	public AllPlayersReady_Script ():void {
        this.setStatusMessage ("All spirits have arrived at Savage Hall");
            
        this.m_continueButton.setDisabled (false);

        this.m_continueButton.addMouseUpListener (() => {
            this.m_continueButton.setDisabled (true);

            this.getGameInstance ().gotoState ("AudioTest")

            var __user:SFS2X.SFSUser;

            for (__user of ConnectionManager.instance ().getPlayerUserList ()) {
                MessagingManager.instance ().fireSceneChangeSignal (
					__user.id,
					"PlayerIntro",
					"",
					{
					}
				);
            }
        });

    //------------------------------------------------------------------------------------------
		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
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
}

//------------------------------------------------------------------------------------------
export class __DraggableXTextBox extends XTextBox {
	public m_mouseDownFlag:boolean;
	public m_mouseDownX:number;
	public m_mouseDownY:number;

	public m_mouseDownSignal:XSignal;
	public m_mouseUpSignal:XSignal;
	public m_mouseMoveSignal:XSignal;

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

		this.getDraggableArea ().interactive = true;
		this.getDraggableArea ().interactiveChildren = true;

		this.m_mouseDownSignal = this.createXSignal ();
		this.m_mouseUpSignal = this.createXSignal ();
		this.m_mouseMoveSignal = this.createXSignal ();
		
		this.setupListeners ();

		this.m_mouseDownFlag = false;

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}

//------------------------------------------------------------------------------------------
	public getDraggableArea ():PIXI.Graphics {
		return this.m_box.m_fill;
	}

//------------------------------------------------------------------------------------------
	public setupListeners ():void {		
		this.addTask ([
			() => {
				this.addPausableEventListener ("pointerdown", this.getDraggableArea (), this.onMouseDown.bind (this));
				this.addPausableEventListener ("pointermove", this.getDraggableArea (), this.onMouseMove.bind (this));
				this.addPausableEventListener ("pointerup", this.getDraggableArea (), this.onMouseUp.bind (this));
				// this.addPausableEventListener ("pointerout", this.getDraggableArea (), this.onMouseOut.bind (this));
				// this.addPausableEventListener ("pointerupoutside", this.getDraggableArea (), this.onMouseOut.bind (this));
				this.addPausableEventListener ("pointerup", this.m_XApp.stage, this.onMouseUp.bind (this));
			},
				
			XTask.RETN,
		]);
	}

//------------------------------------------------------------------------------------------
	public onMouseDown (e:PIXI.InteractionEvent):void {
		this.m_mouseDownSignal.fireSignal (this, e);

		this.m_mouseDownFlag = true;
	}			

//------------------------------------------------------------------------------------------
	public onMouseUp (e:PIXI.InteractionEvent):void {
		this.m_mouseUpSignal.fireSignal (this, e);

		this.m_mouseDownFlag = false;
	}			

//------------------------------------------------------------------------------------------
	public onMouseOut (e:PIXI.InteractionEvent):void {
		this.m_mouseDownFlag = false;
	}	

//------------------------------------------------------------------------------------------
	public onMouseMove (e:PIXI.InteractionEvent):void {
		if (this.m_mouseDownFlag) {
			this.m_mouseMoveSignal.fireSignal (this, e);
		}
	}			

//------------------------------------------------------------------------------------------
	public addMouseDownListener (__listener:any):number {
		return this.m_mouseDownSignal.addListener (__listener);
	}
				
//------------------------------------------------------------------------------------------
	public addMouseUpListener (__listener:any):number {
		return this.m_mouseUpSignal.addListener (__listener);
	}

//------------------------------------------------------------------------------------------
	public addMouseMoveListener (__listener:any):number {
		return this.m_mouseMoveSignal.addListener (__listener);
	}

//------------------------------------------------------------------------------------------
}