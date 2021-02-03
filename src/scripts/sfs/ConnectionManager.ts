//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'
import * as SFS2X from "sfs2x-api";
import { SFSManager } from '../../engine/sfs/SFSManager';
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
import { GUID } from '../../engine/utils/GUID';
import { MessagingManager } from './MessagingManager';

//------------------------------------------------------------------------------------------
export class ConnectionManager extends XGameObject {
    public static self:ConnectionManager;

    public script:XTask;

    public m_connected:boolean;
	public m_loggedinToZone:boolean;
	public m_joinedRoom:boolean;
	
	public m_connectedSignal:XSignal;
    public m_disconnectedSignal:XSignal;
	public m_loggedInToZoneSignal:XSignal;
    public m_loggedOutOfZoneSignal:XSignal;
    public m_errorSignal:XSignal;
	
	public m_roomID:string;

	public m_sfsRoom:SFS2X.SFSRoom;
	public m_sfsRoomManager:SFS2X.SFSRoomManager;

	public m_sfsUser:SFS2X.SFSUser;
	public m_sfsUserManager:SFS2X.SFSUserManager;

//------------------------------------------------------------------------------------------
    public static instance ():ConnectionManager {
        return ConnectionManager.self;
    }

//------------------------------------------------------------------------------------------	
	constructor () {
        super ();
        
        ConnectionManager.self = this;
	}
	
//------------------------------------------------------------------------------------------
	public setup (__world:XWorld, __layer:number, __depth:number):XGameObject {
        super.setup (__world, __layer, __depth);

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public afterSetup (__params:Array<any> = null):XGameObject {
        super.afterSetup (__params);

		this.m_connectedSignal = this.createXSignal ();
		this.m_disconnectedSignal = this.createXSignal ();
		this.m_loggedInToZoneSignal = this.createXSignal ();
        this.m_loggedOutOfZoneSignal = this.createXSignal ();
		this.m_errorSignal = this.createXSignal ();
		
        this.script = this.addEmptyTask ();

        this.m_connected = false;
		this.m_loggedinToZone = false;
		this.m_joinedRoom = false;

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
		super.cleanup ();
		
		this.m_connectedSignal.removeAllListeners ();
		this.m_disconnectedSignal.removeAllListeners ();
		this.m_loggedInToZoneSignal.removeAllListeners ();
        this.m_loggedOutOfZoneSignal.removeAllListeners ();
		this.m_errorSignal.removeAllListeners ();
	}

	//------------------------------------------------------------------------------------------
	public addConnectedListener (__listener:any):number {
		return this.m_connectedSignal.addListener (__listener);
	}

	//------------------------------------------------------------------------------------------
	public addDisconnectedListener (__listener:any):number {
		return this.m_disconnectedSignal.addListener (__listener);
	}

	//------------------------------------------------------------------------------------------
	public addLoggedIntoZoneListener (__listener:any):number {
		return this.m_loggedInToZoneSignal.addListener (__listener);
	}

	//------------------------------------------------------------------------------------------
	public addLoggedOutOfZoneListener (__listener:any):number {
		return this.m_loggedInToZoneSignal.addListener (__listener);
	}

	//------------------------------------------------------------------------------------------
	public isConnected ():boolean {
		return this.m_connected;
	}

	//------------------------------------------------------------------------------------------
	public isLoggedIntoZone ():boolean {
		return this.m_loggedinToZone;
	}

	//------------------------------------------------------------------------------------------
	public getSFSUserManager ():SFS2X.SFSUserManager {
		return this.m_sfsUserManager;
	}

	//------------------------------------------------------------------------------------------
	public getUserList ():Array<SFS2X.SFSUser> {
		return this.getSFSUserManager ().getUserList ();
	}
	
	//------------------------------------------------------------------------------------------
	public getPlayerUserList ():Array<SFS2X.SFSUser> {
		var __entireUserList:Array<SFS2X.SFSUser> = ConnectionManager.instance ().getSFSUserManager ().getUserList ();
		var __user:SFS2X.SFSuser;
		var i:number = 0;

		var __userList:Array<SFS2X.SFSUser> = new Array<SFS2X.SFSUser> ();

		for (__user of __entireUserList) {
			if (!__user.name.startsWith ("moderator:")) {
				__userList.push (__user);
			}
		}

		return __userList;
	}

	//------------------------------------------------------------------------------------------
	public isJoinedRoom ():boolean {
		return this.m_joinedRoom;
	}

	//------------------------------------------------------------------------------------------
	public Connect_Script (__errorCallback:any):void {
		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					() => {
						SFSManager.instance ().setup ();
                        
						SFSManager.instance ().connect (
							SFSManager.SFS2X_SERVER, 8080,
							(e:SFS2X.SFSEvent) => {
								console.log (": ----------------->: connected: ");
				
                                this.m_connected = true;
                                
                                this.m_connectedSignal.fireSignal ();
                            },
                            () => {
                                console.log (": ----------------->: connection error: ");

								__errorCallback ();

                                this.m_errorSignal.fireSignal ();
                            },
							(e:SFS2X.SFSEvent) => {
								console.log (": ----------------->: disconnected: ");
				
                                this.m_connected = false;
                                
                                this.m_disconnectedSignal.fireSignal ();
                            }
						);
					},

                    XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,
                        
                        XTask.FLAGS, (__task:XTask) => {
                            __task.ifTrue (
                                SFSManager.instance ().isConnected ()
                            );
                        }, XTask.BNE, "loop",

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
	public LoginToZone_Script ( __role:string, __userName:string, __errorCallback:any):void {

		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,
                        
                        () => {
                            SFSManager.instance ().send (new SFS2X.LoginRequest (__role + ":" + __userName + ":" + GUID.create (), "", null, "BasicExamples"));

                            SFSManager.instance ().once (SFS2X.SFSEvent.LOGIN, (e:SFS2X.SFSEvent) => {
								this.m_sfsUser = e.user;
								this.m_sfsUserManager = this.m_sfsUser.getUserManager ();
					
								MessagingManager.instance ().setup (this.m_sfsUser);

								console.log (": logged in: ", e, this.m_sfsUser);
								
                                this.m_loggedinToZone = true;
                                
                                this.m_loggedInToZoneSignal.fireSignal ();
                            });

                            SFSManager.instance ().once (SFS2X.LOGIN_ERROR, (e:SFS2X.SFSEvent) => {
                                console.log (": login error: ", e);

								__errorCallback (e);

                                this.m_errorSignal.fireSignal ();
                            });
                            
                            SFSManager.instance ().once (SFS2X.SFSEvent.LOGOUT, (e:SFS2X.SFSEvent) => {
								console.log (": logged out: ", e);
								
                                this.m_loggedinToZone = false;
                                
                                this.m_loggedOutOfZoneSignal.fireSignal ();
                            });
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
	public JoinRoom_Script (__roomID:string):void {
		this.m_roomID = __roomID;
	
		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,
                        
                        () => {
							SFSManager.instance ().send (new SFS2X.JoinRoomRequest (__roomID));

							SFSManager.instance ().once (SFS2X.SFSEvent.ROOM_JOIN, (e:SFS2X.SFSEvent) => {
								var __sfsRoom:SFS2X.SFSRoom = this.m_sfsRoom = e.room as SFS2X.SFSRoom;

								console.log (": joined Room: ", __sfsRoom);
					
								this.m_joinedRoom = true;
							});
							
							SFSManager.instance ().once (SFS2X.SFSEvent.ROOM_JOIN_ERROR, (e:SFS2X.SFSEvent) => {
								console.log (": join room error: ", e);

								this.m_joinedRoom = false;

								this.m_errorSignal.fireSignal ();
							});
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
}