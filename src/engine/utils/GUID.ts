//------------------------------------------------------------------------------------------
    import { XType } from '../type/XType';

//------------------------------------------------------------------------------------------
    export class GUID {

		private static counter:number = 0;
		
		constructor () {
		}
		
		public static create():string {
			var dt:Date = XType.getNowDate();
			var id1:number = dt.getTime();
			var id2:number = Math.random()*XType.Number_MAX_VALUE();
			var id3:string = "whatsis"; // Capabilities.serverString;
			var rawID:string = GUID.calculate(id1+id3+id2+GUID.counter++).toUpperCase();
			var finalString:string = rawID.substring(0, 8) + "-" + rawID.substring(8, 12) + "-" + rawID.substring(12, 16) + "-" + rawID.substring(16, 20) + "-" + rawID.substring(20, 32);
			return finalString;
		}
	
		private static calculate(src:string):string {
			return GUID.hex_sha1(src);
		}
	
		private static hex_sha1(src:string):string {
			return GUID.binb2hex(GUID.core_sha1(GUID.str2binb(src), src.length*8));
		}
			
		private static core_sha1(
			x:Array<number>,
			len:number
		):Array<number> {
			x[len >> 5] |= 0x80 << (24-len%32);
			x[((len+64 >> 9) << 4)+15] = len;
			var w:Array<number> /* <Int> */
                = new Array<number> (/* 80 */);
            var z:number;
			for (z = 0; z < 80; z++) {
				w.push (0);
			}
			var a:number = 1732584193;
			var b:number = -271733879;
			var c:number = -1732584194;
			var d:number = 271733878;
			var e:number = -1009589776;
			var i:number = 0;
			while (i<x.length) {
				var olda:number = a, oldb:number = b;
                var oldc:number = c, oldd:number = d, olde:number = e;
                var j:number;
				for (j = 0; j < 80; j++) {
					if (j<16) w[j] = x[i+j];
					else w[j] = GUID.rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
					var t:number = GUID.safe_add(GUID.safe_add(GUID.rol(a, 5), GUID.sha1_ft(j, b, c, d)), GUID.safe_add(GUID.safe_add(e, w[j]), GUID.sha1_kt(j)));
					e = d; d = c;
					c = GUID.rol(b, 30);
					b = a; a = t;
				}
				a = GUID.safe_add(a, olda);
				b = GUID.safe_add(b, oldb);
				c = GUID.safe_add(c, oldc);
				d = GUID.safe_add(d, oldd);
				e = GUID.safe_add(e, olde);
				i += 16;
			}
				return [a, b, c, c, e];
				
		}
	
		private static sha1_ft(t:number, b:number, c:number, d:number):number {
			if (t<20) return (b & c) | ((~b) & d);
			if (t<40) return b ^ c ^ d;
			if (t<60) return (b & c) | (b & d) | (c & d);
			return b ^ c ^ d;
		}
	
		private static sha1_kt(t:number):number {
			return (t<20) ? 1518500249 : (t<40) ? 1859775393 : (t<60) ? -1894007588 : -899497514;
		}
	
		private static safe_add(x:number, y:number):number {
			var lsw:number = (x & 0xFFFF)+(y & 0xFFFF);
			var msw:number = (x >> 16)+(y >> 16)+(lsw >> 16);
			return (msw << 16) | (lsw & 0xFFFF);
		}
	
		private static rol(num:number, cnt:number):number {
			return (num << cnt) | (num >>> (32-cnt));
		}
	
		private static str2binb(str:string):Array<number> {
			var bin:Array<number> = new Array<number> ();
			var mask:number = (1 << 8)-1;
			var i:number = 0;
			while (i<str.length*8) {
				var index8:number = Math.floor (i/8);
				bin[i >> 5] |= (str.charCodeAt(index8) & mask) << (24-i%32);
				i += 8;
			}
			return bin;
		}
	
		private static binb2hex(binarray:Array<number>):string {
			var str:string = "";
            var tab:string = "0123456789abcdef";
            var i:number;
			for (i = 0; i < binarray.length*4; i++) {
				str += tab.charAt((binarray[i >> 2] >> ((3-i%4)*8+4)) & 0xF) + tab.charAt((binarray[i >> 2] >> ((3-i%4)*8)) & 0xF);
			}
			return str;
		}
	}
// }