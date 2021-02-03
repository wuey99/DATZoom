//------------------------------------------------------------------------------------------
import * as SFS2X from "sfs2x-api";
import { SFSManager } from '../../engine/sfs/SFSManager';
import { XSignal } from '../../engine/signals/XSignal';
import { XType } from "../../engine/type/XType";

//------------------------------------------------------------------------------------------	
	export class MessagingManager {	
        public static self:MessagingManager;

        public m_sfsRoom:SFS2X.SFSRoom;
        public m_sfsRoomManager:SFS2X.SFSRoomManager;

        public m_sfsUser:SFS2X.SFSUser;
        public m_sfsUserManager:SFS2X.SFSUserManager;
    
        public m_readySignal:Map<number, XSignal>;
        public m_completeSignal:Map<number, XSignal>;
        public m_triggerSignal:Map<string, XSignal>;
        public m_sceneChangeSignal:Map<number, XSignal>;
        
        public static READY_SIGNAL:string = "ready";
        public static COMPLETE_SIGNAL:string = "complete";
        public static TRIGGER_SIGNAL:string = "trigger";
        public static SCENECHANGE_SIGNAL:string = "scene-change";

        public static ALL_PLAYERS:number = -1;
        public static ALL_IN_ROOM:number = -2;
        public static MODERATOR:number = -3;

    //------------------------------------------------------------------------------------------
        public static instance ():MessagingManager {
            if (MessagingManager.self == null) {
                new MessagingManager ();
            }   

            return MessagingManager.self;
        }

    //------------------------------------------------------------------------------------------
        constructor () {
            MessagingManager.self = this;
        }

    //------------------------------------------------------------------------------------------
        public setup (__sfsUser:SFS2X.SFSUser):void {
            this.m_sfsUser = __sfsUser;
            this.m_sfsUserManager = __sfsUser.getUserManager ();

            this.m_readySignal = new Map<number, XSignal> ();
            this.m_completeSignal = new Map<number, XSignal> ();
            this.m_triggerSignal = new Map<string, XSignal> ();
            this.m_sceneChangeSignal = new Map<number, XSignal> ();

            SFSManager.instance ().addEventListener (SFS2X.SFSEvent.PRIVATE_MESSAGE, this.onPrivateMessage.bind (this));
        }

    //------------------------------------------------------------------------------------------
        public cleanup ():void {
            XType.forEach (this.m_readySignal,
                (__userId:number) => {
                    this.m_readySignal.get (__userId).removeAllListeners ();
                }
            );

            XType.forEach (this.m_completeSignal,
                (__userId:number) => {
                    this.m_completeSignal.get (__userId).removeAllListeners ();
                }
            );

            XType.forEach (this.m_triggerSignal,
                (__triggerID:string) => {
                    this.m_triggerSignal.get (__triggerID).removeAllListeners ();
                }
            );

            XType.forEach (this.m_sceneChangeSignal,
                (__userId:number) => {
                    this.m_sceneChangeSignal.get (__userId).removeAllListeners ();
                }
            );
        }

	//------------------------------------------------------------------------------------------
        public onPrivateMessage (e:SFS2X.SFSEvent):void {
            console.log (": onPrivateMessage: ", e);

            var __userId:number = e.sender.id;

            switch (e.message) {
                case MessagingManager.READY_SIGNAL:
                    if (this.m_readySignal.has (__userId)) {
                        this.m_readySignal.get (__userId).fireSignal ();
                    }

                    break;

                case MessagingManager.COMPLETE_SIGNAL:
                    if (this.m_completeSignal.has (__userId)) {
                        this.m_completeSignal.get (__userId).fireSignal ();
                    }

                    break;

                case MessagingManager.TRIGGER_SIGNAL:
                    var __params:SFS2X.SFSObject = e.data;
                    var __triggerName:string = __params.getUtfString ("__triggerName__");

                    if (this.m_triggerSignal.has (__triggerName + __userId)) {
                        this.m_triggerSignal.get (__triggerName + __userId).fireSignal (__params);
                    }

                    break;

                case MessagingManager.SCENECHANGE_SIGNAL:
                    if (this.m_sceneChangeSignal.has (__userId)) {
                        var __params:SFS2X.SFSObject = e.data;

                        this.m_sceneChangeSignal.get (__userId).fireSignal (
                            __params.getUtfString ("stateName"),
                            __params.getUtfString ("xmlBoxString"),
                            __params
                        );
                    }
                
                    break;
            }
        }

    //------------------------------------------------------------------------------------------
        public getModeratorID ():number {
            var __userList:Array<SFS2X.SFSUser> = this.m_sfsUserManager.getUserList ();

            var __user:SFS2X.SFSUser;

            for (__user of __userList) {
                if (__user.name.startsWith ("moderator:")) {
                    return __user.id;
                }
            }

            return -1;
        }

    //------------------------------------------------------------------------------------------
    public getUserManager ():SFS2X.SFSRoomManager {
        this.m_sfsUserManager;
    }

    //------------------------------------------------------------------------------------------
        public fireReadySignal (__userId:number):void {
            this.fireSignal (__userId,
                (__userId:number) => {
                    SFSManager.instance ().send (new SFS2X.PrivateMessageRequest (MessagingManager.READY_SIGNAL, __userId));
                }
            );
        }

    //------------------------------------------------------------------------------------------
        public fireCompleteSignal (__userId:number):void {
            this.fireSignal (__userId,
                (__userId:number) => {
                    SFSManager.instance ().send (new SFS2X.PrivateMessageRequest (MessagingManager.COMPLETE_SIGNAL, __userId));
                }
            );
        }

    //------------------------------------------------------------------------------------------
        private serializeToSFSObject (__object:SFS2X.SFSObject, __params:any):SFS2X.SFSObject {
            var __paramName:string;

            for (__paramName in __params) {
                switch (typeof __params[__paramName]) {
                    case "string":
                        __object.putUtfString (__paramName, __params[__paramName]);

                        break;

                    case "number":
                        __object.putFloat (__paramName, __params[__paramName]);

                        break;

                    case "boolean":
                            __object.putBoolean (__paramName, __params[__paramName]);

                        break;

                    case "object":
                        if (Array.isArray (__params[__paramName])) {
                            var __type:string = typeof __params[0];

                            switch (typeof __type) {
                                case "string":
                                    __object.putUtfStringArray (__paramName, __params);
                
                                    break;
                
                                case "number":
                                    __object.putFloatArray (__paramName, __params);
                
                                    break;
                
                                case "boolean":
                                    __object.putBooleanArray (__paramName, __params);
                
                                    break;
                            }
                        } else {
                            __object.putSFSObject (__paramName, this.serializeToSFSObject (new SFS2X.SFSObject (), __params[__paramName]));
                        }

                        break;
                }
            }

            return __object;
        }

    //------------------------------------------------------------------------------------------
        public fireTriggerSignal (__userId:number, __triggerName:string, __params:any):void {
            var __object:SFS2X.SFSObject;

            if (__params instanceof SFS2X.SFSObject) {
                __object = __params as SFS2X.SFSObject;
            } else {
                __object = this.serializeToSFSObject (new SFS2X.SFSObject (), __params);
            }

            __object.putUtfString ("__triggerName__", __triggerName);

            this.fireSignal (__userId,
                (__userId:number) => {
                    SFSManager.instance ().send (new SFS2X.PrivateMessageRequest (MessagingManager.TRIGGER_SIGNAL, __userId, __object));
                }
            );
        }

    //------------------------------------------------------------------------------------------
        public fireSceneChangeSignal (__userId:number, __stateName:string, __xmlBoxString:string, __params:any = null):void {
            this.fireSignal (__userId,
                (__userId:number) => {
                    var __object:SFS2X.SFSObject;
                    
                    if (__params == null) {
                        __object = new SFS2X.SFSObject ();
                    } else if (__params instanceof SFS2X.SFSObject) {
                        __object = __params as SFS2X.SFSObject;
                    } else {
                        __object = this.serializeToSFSObject (new SFS2X.SFSObject (), __params);
                    }

                    __object.putUtfString ("stateName", __stateName);
                    __object.putUtfString ("xmlBoxString", __xmlBoxString);
                    
                    SFSManager.instance ().send (new SFS2X.PrivateMessageRequest (MessagingManager.SCENECHANGE_SIGNAL, __userId, __object));
                }
            );
        }

    //------------------------------------------------------------------------------------------
        public fireSignal (__userId:number, __callback:any):void {
            var __userList:Array<SFS2X.SFSUser> = this.m_sfsUserManager.getUserList ();
            var __user:SFS2X.SFSUser;

            switch (__userId) {
                case MessagingManager.ALL_PLAYERS:
                    for (__user of __userList) {
                        if (!__user.isItMe && !__user.name.startsWith ("moderator:")) {
                            __callback (__user.id);
                        }
                    }

                    break;

                case MessagingManager.ALL_IN_ROOM:
                    for (__user of __userList) {
                        if (!__user.isItMe) {
                            __callback (__user.id);
                        }
                    }

                    break;

                case MessagingManager.MODERATOR:
                    for (__user of __userList) {
                        if (!__user.isItMe && __user.name.startsWith ("moderator:")) {
                            __callback (__user.id);
                        }
                    }
    
                    break;

                default:
                    __callback (__userId);

                    break;
            }
        }

	//------------------------------------------------------------------------------------------
        public addReadyListener (__userId:number, __listener:any):number {
            if (!this.m_readySignal.has (__userId)) {
                this.m_readySignal.set (__userId, new XSignal ());
            }

            return this.m_readySignal.get (__userId).addListener (__listener);
        }

	//------------------------------------------------------------------------------------------
        public removeReadyListener (__userId:number, __id):void {
            if (this.m_readySignal.has (__userId)) {
                return this.m_readySignal.get (__userId).removeListener (__id);
            }
        }

	//------------------------------------------------------------------------------------------
        public addCompleteListener (__userId:number, __listener:any):number {
            if (!this.m_completeSignal.has (__userId)) {
                this.m_completeSignal.set (__userId, new XSignal ());
            }

            return this.m_completeSignal.get (__userId).addListener (__listener);
        }

	//------------------------------------------------------------------------------------------
        public removeCompleteListener (__userId:number, __id):void {
            if (this.m_completeSignal.has (__userId)) {
                return this.m_completeSignal.get (__userId).removeListener (__id);
            }
        }
	
	//------------------------------------------------------------------------------------------
        public addTriggerListener (__userId:number, __triggerName:string, __listener:any):number {
            if (!this.m_triggerSignal.has (__triggerName + __userId)) {
                this.m_triggerSignal.set (__triggerName + __userId, new XSignal ());
            }

            return this.m_triggerSignal.get (__triggerName + __userId).addListener (__listener);
        }

	//------------------------------------------------------------------------------------------
        public removeTriggerListener  (__triggerID:string, __id):void {
            if (this.m_triggerSignal.has (__triggerID)) {
                return this.m_triggerSignal.get (__triggerID).removeListener (__id);
            }
        }

	//------------------------------------------------------------------------------------------
        public addSceneChangeListener (__userId:number, __listener:any):number {
            if (!this.m_sceneChangeSignal.has (__userId)) {
                this.m_sceneChangeSignal.set (__userId, new XSignal ());
            }

            return this.m_sceneChangeSignal.get (__userId).addListener (__listener);
        }

	//------------------------------------------------------------------------------------------
        public removeSceneChangeListener  (__userId:number, __id):void {
            if (this.m_sceneChangeSignal.has (__userId)) {
                return this.m_sceneChangeSignal.get (__userId).removeListener (__id);
            }
        }

//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }
