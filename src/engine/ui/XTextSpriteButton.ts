//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy';
import { XSprite } from '../sprite/XSprite';
import { XWorld } from '../sprite/XWorld';
import { XGameObject} from '../gameobject/XGameObject';
import { XTask } from "../task/XTask";
import { XSignal } from '../signals/XSignal';
import { XApp } from '../app/XApp';
import { XType } from '../type/XType';
import { XButton } from './XButton';
import { XSpriteButton } from './XSpriteButton';
import { XTextSprite } from '../sprite/XTextSprite';

//------------------------------------------------------------------------------------------
export class XTextSpriteButton extends XSpriteButton {
    private m_textSprite:XTextSprite;
    private m_text:string;
    private m_fontName:string;
    private m_fontSize:number;
    private m_colorNormal:number;
    private m_colorOver:number;
    private m_colorDown:number;
    private m_colorSelected:number;
    private m_colorDisabled:number;
    private m_bold:boolean;
    private m_horizontalAlignment:string;
    private m_verticalAlignment:string;

//------------------------------------------------------------------------------------------
	public getParams (__params:Array<any> = null):void {
        this.m_buttonClassName = __params[0];
        this.m_9slice = __params[1];
        this.m_9size = __params[2];
        this.m_9width = __params[3];
        this.m_9height = __params[4];

        // text params
        this.m_text = __params[5];
        this.m_fontName = __params[6];
        this.m_fontSize = __params[7];
        this.m_colorNormal = __params[8];
        this.m_colorOver = __params[9];
        this.m_colorDown = __params[10];
        this.m_colorSelected = __params[11];
        this.m_colorDisabled = __params[12];
        this.m_bold = __params[13];
        this.m_horizontalAlignment = __params[14];
        this.m_verticalAlignment = __params[15];
	}

//------------------------------------------------------------------------------------------
    public createHighlightTask ():void {
        super.createHighlightTask ();

        this.addTask ([
            XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,
                    
                () => {
                    switch (this.m_label) {
                        case XButton.NORMAL_STATE:
                            (this.m_textSprite as XTextSprite).color = this.m_colorNormal;
                            break;
                        case XButton.OVER_STATE:
                            (this.m_textSprite as XTextSprite).color = this.m_colorOver;
                            break;
                        case XButton.DOWN_STATE:
                            (this.m_textSprite as XTextSprite).color = this.m_colorDown;
                            break;
                        case XButton.SELECTED_STATE:
                            (this.m_textSprite as XTextSprite).color = this.m_colorSelected;
                            break;
                        case XButton.DISABLED_STATE:
                            (this.m_textSprite as XTextSprite).color = this.m_colorDisabled;
                            break;
                    }
                },
                                    
            XTask.GOTO, "loop",
        ]);
    }

//------------------------------------------------------------------------------------------
// create sprites
//------------------------------------------------------------------------------------------
	public createSprites ():void {
        super.createSprites ();

		this.m_textSprite = this.createXTextSprite (
            this.m_sprite.width,
            this.m_sprite.height,
            this.m_text,
            this.m_fontName,
            this.m_fontSize,
            this.m_colorNormal,
            this.m_bold,
            this.m_horizontalAlignment,
            this.m_verticalAlignment
        );
        
        this.addSortableChild (this.m_textSprite, this.getLayer (), this.getDepth () + 1, false);
			
		this.gotoState (XButton.NORMAL_STATE);
			
		this.m_currState = this.getNormalState ();
			
        this.show ();
	}

//------------------------------------------------------------------------------------------	
}