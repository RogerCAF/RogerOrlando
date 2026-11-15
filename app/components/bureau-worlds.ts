/* The Bureau of Impossible Things
   Original, self-contained illustrated story worlds. All portals share a
   measured drawing-space anchor (500, 500) so nested transitions match. */
export type Portal="screen"|"keyhole"|"coffee"|"window"|"moon"|"watch"|"globe"|"book"|"painting";
export const WORLD_TITLES=[
"De werkplek","De deur in het scherm","De receptie van het onmogelijke",
"De stad in de koffie","Reparatie van de maan","Het monster met een hypotheek",
"De directiekamer van de goden","De stad van nergens","De bibliotheek van alles",
"De wereld zonder rand"
];
const portals:Portal[]=["screen","keyhole","coffee","window","moon","watch","globe","book","painting"];
export function portalAt(index:number):Portal{return portals[index]??(["window","watch","painting"][((index-9)%3+3)%3] as Portal);}
export function portalRatio(index:number){return [0.258,0.078,0.24,0.126,0.19,0.18,0.21,0.18,0.24][index]??0.2;}
export function worldTitle(index:number){return index<WORLD_TITLES.length?WORLD_TITLES[index]: "De wereld zonder rand · "+(index-8);}
type Palette={bg:string;paper:string;wall:string;shadow:string;ink:string;accent:string;rose:string;ochre:string;white:string};
const p:Palette={bg:"#d8e4e1",paper:"#f5f1e8",wall:"#e5e9de",shadow:"#91aaa4",ink:"#41535b",accent:"#789c98",rose:"#c79282",ochre:"#d6b17c",white:"#fcf9f0"};
const q:Palette={...p,bg:"#d6e6dc",wall:"#eaf0e3",shadow:"#8cae9a",accent:"#6f9d8d"};
const a:Palette={...p,bg:"#e6d7d0",wall:"#f0e4d9",shadow:"#a9b4a5",accent:"#8ea39c"};
const b:Palette={...p,bg:"#cbd8e1",wall:"#e1e9e5",shadow:"#7b9ba4",accent:"#84a3b5"};
const palettes=[p,q,a,p,b,a,q,b,p];
const xml=(s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const path=(d:string,f:string,s="#41535b",w=3)=>'<path d="'+d+'" fill="'+f+'" stroke="'+s+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"/>';
const rect=(x:number,y:number,w:number,h:number,fill:string,stroke="#41535b",rx=0,sw=3)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
const circ=(x:number,y:number,r:number,fill:string,stroke="#41535b",sw=3)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
const ellipse=(x:number,y:number,rx:number,ry:number,fill:string,stroke="#41535b",sw=3)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
const line=(x:number,y:number,xx:number,yy:number,col="#41535b",sw=3)=>'<path d="M'+x+' '+y+' L'+xx+' '+yy+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="round"/>';
const txt=(x:number,y:number,t:string,size=17,color="#41535b",anchor="middle")=>'<text x="'+x+'" y="'+y+'" font-family="Trebuchet MS,Arial,sans-serif" text-anchor="'+anchor+'" font-size="'+size+'" fill="'+color+'" letter-spacing=".15">'+xml(t)+'</text>';
const g=(tr:string,content:string)=>'<g transform="'+tr+'">'+content+'</g>';
const rand=(seed:number)=>{const x=Math.sin(seed*17.344+113.4)*22340;return x-Math.floor(x);};
function mouse(x:number,y:number,z=1,look=1,withCheese=false){
 let s=ellipse(0,0,40,23,p.shadow,p.ink,2.6)+ellipse(28,-12,22,17,p.paper,p.ink,2.6);
 s+=ellipse(9,-32,15,18,p.rose,p.ink,2.4)+ellipse(32,-33,12,15,p.rose,p.ink,2.4);
 s+=circ(35,-15,3,p.ink,p.ink,1)+circ(49,-7,2.5,p.ink,p.ink,1);
 s+=path("M-35 8 Q-91 33 -95 -14","none",p.ink,3);
 s+=line(46,-4,69,-11,p.ink,1.8)+line(46,-2,71,4,p.ink,1.8);
 s+=path("M-16 19 l-8 13 M17 20 l8 13","none",p.ink,2.2);
 if(withCheese)s+=path("M65 12 L100 5 L91 34 Z",p.ochre,p.ink,2)+circ(83,19,4,p.paper,p.ochre,1);
 return g("translate("+x+" "+y+") scale("+(z*look)+" "+z+")",s);
}
function note(x:number,y:number,s:string,w=190,tilt=0){return g("translate("+x+" "+y+") rotate("+tilt+")",rect(-w/2,-27,w,52,p.white,p.ink,5,2)+txt(0,3,s,Math.min(16,430/s.length),p.ink));}
function dots(seed=4,n=85){let s="";for(let i=0;i<n;i++){const x=Math.round(rand(seed+i*5.4)*960)+20,y=Math.round(rand(seed+i*8.2)*960)+20;s+=circ(x,y,i%14===0?2:1,p.ink+"34","none",0);}return s;}
function plant(x:number,y:number,scale=1){
 let s=path("M0 0 Q-19 -52 -7 -112 M-10 -39 Q30 -78 45 -74 M-7 -74 Q-44 -104 -47 -92","none",p.ink,3);
 for(let i=0;i<5;i++){const yy=-20-i*21,xx=i%2?12:-16;s+=ellipse(xx,yy,21,8,p.accent,p.ink,2);}
 return g("translate("+x+" "+y+") scale("+scale+")",s);
}
function lamp(x:number,y:number){return g("translate("+x+" "+y+")",line(0,-140,0,-26,p.ink,3)+path("M-39 -25 Q0 -94 39 -25 Z",p.ochre,p.ink,3)+ellipse(0,-23,33,8,p.white,p.ochre,2));}
function book(x:number,y:number,w:number,h:number,fill:string){return g("translate("+x+" "+y+")",rect(0,0,w,h,fill,p.ink,2,2)+line(5,6,5,h-7,p.white,2)+line(10,h*.35,w-5,h*.35,p.white,1));}
function floorLines(vanishY=480){let s=path("M0 "+vanishY+" L0 1000 H1000 L1000 "+vanishY+" Z",p.paper,p.ink,2);for(let i=-4;i<=12;i++)s+=line(500,vanishY,i*105,1000,p.shadow+"88",1.4);for(let i=0;i<7;i++){const yy=vanishY+Math.pow(i/6,1.55)*(1000-vanishY);s+=line(0,yy,1000,yy,p.shadow+"65",1.4);}return s;}
function edge(){return '<rect width="990" height="990" x="5" y="5" fill="none" stroke="'+p.ink+'" opacity=".12" stroke-width="10"/>';}
function portalFrame(type:Portal){
 if(type==="screen")return rect(345,357,310,255,p.ink,p.ink,18,7)+rect(371,390,258,181,p.bg,p.white,7,3)+rect(470,616,60,23,p.ink,p.ink,2,2)+rect(435,639,130,12,p.ink,p.ink,4,2);
 if(type==="keyhole")return path("M500 448 C465 448 458 470 458 487 Q458 507 473 519 L463 552 Q500 562 537 552 L527 519 Q542 506 542 487 C542 462 523 448 500 448 Z",p.ink,p.ochre,9);
 if(type==="coffee")return ellipse(500,500,121,48,p.ochre,p.ink,5)+ellipse(500,500,109,38,p.accent,p.ink,2);
 if(type==="window")return path("M436 581 L436 463 Q436 401 500 401 Q564 401 564 463 L564 581 Z",p.ochre,p.ink,7);
 if(type==="moon")return circ(500,500,116,p.ochre,p.ink,7)+circ(500,500,103,p.bg,p.ink,3);
 if(type==="watch")return circ(500,500,110,p.ochre,p.ink,7)+circ(500,500,93,p.bg,p.ink,3);
 if(type==="globe")return circ(500,500,121,p.ochre,p.ink,7)+circ(500,500,105,p.bg,p.ink,3);
 if(type==="book")return path("M375 397 Q449 375 500 413 Q559 369 625 397 L625 603 Q556 580 500 627 Q452 583 375 604 Z",p.white,p.ink,7);
 return rect(385,385,230,230,p.ochre,p.ink,5,9)+rect(403,403,194,194,p.bg,p.paper,2,3);
}
function openingWindowArt(){return path("M436 581 L436 463 Q436 401 500 401 Q564 401 564 463 L564 581 Z",p.bg,p.ink,2);}
function desk(){
 let s=rect(0,0,1000,1000,p.wall,"none")+rect(0,0,1000,610,p.paper,"none");
 s+=floorLines(610);
 s+=path("M0 0 H1000 V130 L500 158 L0 130 Z",p.wall,p.ink,2);
 s+=line(88,0,88,650,p.shadow,2)+line(908,0,908,650,p.shadow,2);
 s+=rect(104,238,162,235,p.white,p.ink,8,4)+rect(119,255,132,153,p.bg,p.ink,3,2)+path("M121 393 L190 292 L251 393",p.accent,p.ink,2)+txt(185,446,"PLAN B",17);
 s+=rect(730,180,190,268,p.paper,p.ink,4,4)+rect(748,200,152,230,p.white,p.ink,2,2);
 s+=note(825,257,"NIET AANKOMEN",149,-4)+line(758,296,879,296,p.ink,2)+txt(820,324,"(Iemand deed het toch.)",12);
 s+=lamp(320,224)+lamp(678,202);
 s+=path("M150 720 L849 720 L956 884 L43 884 Z",p.ochre,p.ink,9)+path("M170 720 L828 720 L898 845 L100 845 Z",p.paper,p.ink,4);
 s+=rect(180,875,56,120,p.ink,p.ink,2,2)+rect(774,875,56,120,p.ink,p.ink,2,2);
 s+=rect(278,692,173,21,p.white,p.ink,5,3)+txt(364,707,"BONUS: +1 KOFFIE",12);
 s+=ellipse(720,766,64,18,p.shadow,"none")+circ(715,736,27,p.white,p.ink,4)+path("M739 725 Q781 704 774 744 Q769 764 739 748","none",p.ink,4);
 s+=plant(145,712,.76)+plant(896,720,.65);
 // The human observer is slightly off-center; the screen is the unblocked portal.
 s+=ellipse(787,1017,164,150,p.accent,p.ink,8)+path("M703 868 Q714 764 790 774 Q870 779 880 872 L905 1020 H676Z",p.shadow,p.ink,7);
 s+=ellipse(792,746,68,76,p.ochre,p.ink,6)+path("M721 716 Q752 630 816 668 Q850 678 850 735 Q817 706 784 710 Q758 730 726 739Z",p.ink,p.ink,3);
 s+=ellipse(838,738,8,13,p.rose,p.ink,2);
 s+=rect(285,642,420,43,p.ink,p.ink,10,4);
 s+=portalFrame("screen");
 s+=mouse(318,849,.63,1,true);
 s+=note(238,921,"WERELD 0 / WIE KIJKT?",278,-5);
 s+=dots(12,50);
 return s;
}
function corridor(){
 let s=rect(0,0,1000,1000,p.paper,"none")+path("M0 0 H1000 L710 358 H290Z",p.wall,p.ink,4);
 s+=path("M0 0 L290 358 L290 715 L0 1000Z",p.shadow,p.ink,5);
 s+=path("M1000 0 L710 358 L710 715 L1000 1000Z",p.bg,p.ink,5);
 s+=path("M0 1000 L290 715 H710 L1000 1000Z",p.paper,p.ink,5);
 for(let i=0;i<9;i++){let y=720+i*35;s+=line(0,y,1000,y,p.shadow,1.4);}
 for(let i=-3;i<13;i++)s+=line(500,715,i*94,1000,p.shadow,1.2);
 // Recessed door with clear miniature keyhole, framed by perspective hall.
 s+=path("M349 704 V345 Q349 222 500 222 Q651 222 651 345 V704 Z",p.ochre,p.ink,9);
 s+=path("M377 690 V340 Q377 263 500 263 Q623 263 623 340 V690 Z",p.wall,p.ink,4);
 s+=path("M416 679 V347 Q416 300 500 300 Q584 300 584 347 V679 Z",p.paper,p.ink,4);
 for(let i=0;i<7;i++){const x=429+i*24;s+=line(x,355,x,656,p.shadow+"68",1);}
 s+=circ(553,526,10,p.ochre,p.ink,2.2);
 s+=portalFrame("keyhole");
 s+=g("translate(220 420)",rect(-93,-78,184,158,p.ochre,p.ink,4,6)+rect(-76,-61,150,125,p.bg,p.ink,3,3)+path("M-60 48 Q-20 -5 18 19 L75 57 H-60Z",p.accent,p.ink,3));
 s+=g("translate(791 425)",rect(-86,-90,172,166,p.ochre,p.ink,4,6)+rect(-69,-72,139,130,p.paper,p.ink,2,3)+circ(0,-21,28,p.rose,p.ink,3));
 s+=mouse(256,790,.9,1)+mouse(804,866,.56,-1,true);
 s+=note(718,761,"ALLEEN VOOR ONMOGELIJKE ZAKEN",390,3);
 s+=lamp(500,182);s+=dots(84,65);
 return s;
}
function reception(){
 let s=rect(0,0,1000,1000,p.wall,"none")+rect(0,0,1000,527,p.paper,"none")+floorLines(534);
 s+=path("M0 0 L300 0 L300 535 L0 800Z",p.bg,p.ink,4)+path("M1000 0 L720 0 L720 535 L1000 800Z",p.bg,p.ink,4);
 s+=rect(85,168,293,180,p.white,p.ink,14,5)+txt(232,223,"BUREAU OF",24)+txt(232,255,"IMPOSSIBLE THINGS",22)+line(119,275,345,275,p.ink,2)+txt(235,302,"CHAOS HIER MELDEN",17);
 s+=rect(722,165,199,166,p.ochre,p.ink,8,4)+txt(821,216,"WACHTTIJD",18)+txt(821,263,"4 EEUWEN",28);
 s+=lamp(503,208);
 s+=path("M160 659 L840 659 L942 865 L60 865Z",p.shadow,p.ink,8);
 s+=path("M210 642 L799 642 L833 725 H167 Z",p.ochre,p.ink,5);
 s+=rect(164,727,672,158,p.accent,p.ink,6,7);
 for(let i=0;i<8;i++)s+=line(193+i*84,745,193+i*84,861,p.paper+"54",2);
 // Friendly office dragon with a tiny tie and a badly filled-in form.
 s+=g("translate(255 602)",ellipse(0,-115,64,88,p.accent,p.ink,5)+circ(0,-199,68,p.accent,p.ink,5)+path("M-49 -243 L-79 -280 L-15 -258 M31 -247 L67 -294 L75 -225",p.ochre,p.ink,4)+circ(-20,-209,5,p.ink)+circ(23,-208,5,p.ink)+ellipse(3,-180,23,12,p.paper,p.ink,2)+path("M0 -67 L-12 -28 L4 -8 L15 -34Z",p.rose,p.ink,3));
 s+=g("translate(786 625)",ellipse(0,-128,57,77,p.white,p.ink,4)+ellipse(-20,-213,56,53,p.white,p.ink,4)+ellipse(35,-213,50,52,p.white,p.ink,4)+ellipse(4,-235,68,48,p.white,p.ink,4)+line(0,-178,0,-86,p.shadow,5)+circ(-9,-216,4,p.ink)+circ(21,-216,4,p.ink));
 s+=rect(699,583,110,48,p.white,p.ink,2,2)+txt(750,612,"NR. 843",14);
 // Coffee has a real circular visible window into the next painted world.
 s+=ellipse(500,593,172,31,p.ink+"55","none");
 s+=path("M378 512 L399 629 Q500 683 605 628 L623 512Z",p.white,p.ink,5);
 s+=path("M626 533 Q721 514 699 579 Q685 613 625 600","none",p.ink,18);
 s+=portalFrame("coffee");
 s+=mouse(155,899,.83,1,true)+mouse(858,917,.65,-1);
 s+=note(774,948,"EEN DORP PER FORMULIER",364,-3);
 s+=dots(205,46);return s;
}
function coffeeCity(){
 let s=rect(0,0,1000,1000,p.bg,"none");
 s+=ellipse(500,550,558,432,p.shadow,p.ink,5);
 s+=ellipse(500,554,520,397,p.accent,p.ink,4);
 for(let i=0;i<18;i++){const yy=230+i*40;s+=path("M-25 "+yy+" Q180 "+(yy-30)+" 360 "+yy+" T740 "+yy+" T1040 "+yy,"none",p.paper+"70",2);}
 for(let i=0;i<19;i++){const x=rand(i*14+4)*1000,y=rand(i*27+8)*770+115;s+=ellipse(x,y,26+rand(i)*22,9,p.paper+"b5","none",0);}
 s+=path("M88 653 Q196 539 336 649 Q418 577 539 638 L555 819 Q215 889 81 756Z",p.wall,p.ink,4);
 s+=path("M679 720 Q758 604 917 669 L987 879 L704 898Z",p.ochre,p.ink,4);
 s+=g("translate(192 591)",path("M-68 17 L0 -67 L75 17Z",p.rose,p.ink,4)+rect(-59,17,118,118,p.paper,p.ink,2,4)+rect(-15,54,30,74,p.accent,p.ink,3,3));
 s+=g("translate(773 666)",path("M-75 13 L0 -68 L75 13Z",p.rose,p.ink,4)+rect(-60,13,124,113,p.paper,p.ink,2,4)+rect(-22,49,38,48,p.ochre,p.ink,3,2));
 s+=g("translate(500 460)",path("M-155 4 L0 -162 L155 4Z",p.rose,p.ink,6)+rect(-125,4,250,199,p.paper,p.ink,5,6)+rect(-103,33,60,65,p.ochre,p.ink,5,3)+rect(48,32,57,60,p.ochre,p.ink,5,3));
 s+=portalFrame("window");
 s+=g("translate(310 792)",path("M-66 -10 H67 L45 14 H-41Z",p.ochre,p.ink,3)+line(0,-14,0,-116,p.ink,3)+path("M0 -110 L57 -22 H0Z",p.white,p.ink,2)+mouse(18,-5,.29,1));
 s+=mouse(729,823,.8,-1,true);
 s+=note(190,890,"NIET ROEREN",237,4)+note(793,920,"HIER WONEN MENSEN",300,-3);
 s+=dots(76,55);return s;
}
function moonWorkshop(){
 let s=rect(0,0,1000,1000,p.paper,"none")+floorLines(635);
 s+=rect(70,194,252,255,p.bg,p.ink,7,6)+rect(94,219,205,202,p.white,p.ink,5,4)+txt(196,276,"REPARATIES",19)+txt(196,306,"MAAN / STERREN",15);
 s+=rect(732,156,202,231,p.wall,p.ink,4,5)+note(830,237,"GARANTIE: GISTEREN",186,-4)+line(759,290,900,290,p.ink,3);
 s+=path("M167 699 Q500 622 842 698 L916 894 H92Z",p.ochre,p.ink,7);
 s+=circ(500,500,273,p.white,p.ink,8);
 for(let i=0;i<11;i++){let xx=500+Math.sin(i*2.5)*192,yy=500+Math.cos(i*2.5)*177;s+=circ(xx,yy,10+i%4*6,p.shadow,p.ink,2);}
 s+=portalFrame("moon");
 s+=path("M286 470 L286 754 M324 470 L324 754","none",p.ink,5);for(let i=0;i<10;i++)s+=line(286,488+i*27,324,488+i*27,p.ink,3);
 s+=g("translate(728 687)",circ(0,-70,29,p.rose,p.ink,4)+rect(-26,-41,51,64,p.accent,p.ink,8,4)+path("M-26 -25 L-82 -54 M25 -23 L57 -62 M-15 23 L-18 63 M17 23 L31 61","none",p.ink,8));
 s+=mouse(177,842,.8,1)+mouse(813,842,.61,-1,true)+dots(41,50);
 return s;
}
function monsterVillage(){
 let s=rect(0,0,1000,1000,p.bg,"none")+path("M0 660 Q200 440 389 620 Q654 401 1000 615 L1000 1000 H0Z",p.wall,p.ink,5);
 s+=ellipse(500,698,430,262,p.accent,p.ink,9);
 s+=ellipse(410,619,196,178,p.shadow,p.ink,8);
 s+=path("M264 553 Q303 473 345 553 M437 558 Q493 478 531 552","none",p.ink,11);
 s+=ellipse(398,664,38,23,p.paper,p.ink,5)+path("M362 683 Q399 708 433 684","none",p.ink,4);
 for(let i=0;i<9;i++){let xx=295+i*60,yy=440-Math.sin(i*.9)*75;s+=g("translate("+xx+" "+yy+")",path("M-28 0 L0 -35 L28 0Z",p.rose,p.ink,2.5)+rect(-24,0,48,55,p.paper,p.ink,2,2.5)+rect(-8,18,16,24,p.ochre,p.ink,2,1.4));}
 s+=rect(388,846,240,112,p.ochre,p.ink,5,4)+txt(506,881,"HYPOTHEEK",16)+txt(506,907,"37.000 EEUW",21);
 s+=portalFrame("watch");
 s+=mouse(170,852,.8,1,true)+mouse(847,853,.9,-1);
 s+=note(787,922,"AF EN TOE AARDBEVING",305,2);s+=dots(73,40);return s;
}
function godsOffice(){
 let s=rect(0,0,1000,1000,p.wall,"none")+path("M0 615 L1000 615 V1000 H0Z",p.paper,p.ink,4);
 s+=rect(70,142,255,341,p.white,p.ink,4,6)+txt(198,208,"AGENDA",26)+txt(198,255,"MA: SCHEPPING",19)+txt(198,292,"DI: KOFFIE",19)+txt(198,329,"WO: APOCALYPS?",17);
 s+=rect(726,135,222,312,p.bg,p.ink,5,5)+note(837,232,"ZWAARTEKRACHT",189,0)+note(838,297,"NIET AANRAKEN",191,-2);
 s+=g("translate(231 647)",ellipse(0,-75,74,100,p.rose,p.ink,5)+circ(0,-178,65,p.ochre,p.ink,5)+path("M-75 -181 L-32 -269 L4 -202 L42 -269 L76 -186",p.ochre,p.ink,6)+circ(-20,-188,4,p.ink)+circ(19,-188,4,p.ink));
 s+=g("translate(793 652)",ellipse(0,-69,64,93,p.shadow,p.ink,5)+circ(0,-177,61,p.ochre,p.ink,5)+path("M-48 -205 Q0 -258 57 -202","none",p.paper,17)+path("M-26 -184 Q-12 -173 2 -184 M14 -184 Q29 -175 39 -184","none",p.ink,4));
 s+=path("M113 726 L886 726 L976 920 H33Z",p.ochre,p.ink,8)+rect(153,801,694,137,p.paper,p.ink,5,4);
 s+=portalFrame("globe")+ellipse(500,633,195,30,p.shadow+"83","none");
 s+=mouse(139,938,.65,1)+mouse(871,947,.74,-1,true)+dots(72,42);
 return s;
}
function village(index:number,open=false){
 const n=index;
 let s=rect(0,0,1000,1000,open?p.bg:p.wall,"none");
 s+=path("M0 680 Q220 520 440 636 Q713 521 1000 680 L1000 1000 H0Z",p.wall,p.ink,5);
 s+=path("M-80 883 Q270 728 520 890 Q782 748 1080 845","none",p.paper,75);
 s+=path("M-80 883 Q270 728 520 890 Q782 748 1080 845","none",p.ink,3);
 for(let i=0;i<20;i++){
   const x=40+(i%5)*205+(rand(n*14+i)-.5)*55,y=310+Math.floor(i/5)*160;
   if(x>325 && x<670 && y>355 && y<620)continue;
   const w=76+rand(i*23+n)*66,h=84+rand(i*77+n)*89;
   s+=g("translate("+x+" "+y+")",
     path("M"+(-w*.62)+" 0 L0 "+(-h*.75)+" L"+(w*.62)+" 0Z",i%3===0?p.rose:p.ochre,p.ink,3)+
     rect(-w*.48,0,w*.96,h,p.paper,p.ink,3,3)+rect(-w*.16,h*.24,w*.3,h*.36,p.accent,p.ink,2,2));
 }
 s+=note(182,740,n%2?"DRAGONS NOT PARKING":"VERLOREN MINUTEN",270,-4);
 s+=note(790,833,n%3?"OPEN SINDS MORGEN":"AFSLAG NERGENS",300,3);
 s+=portalFrame(open?portalAt(index):"book");
 for(let i=0;i<10;i++)s+=mouse(Math.round(rand(n*80+i)*940)+25,702+Math.round(rand(i*20+n)*251),.25+rand(i+n)*.22,i%2?1:-1,i%4===0);
 s+=dots(n*12,60);return s;
}
function library(){
 let s=rect(0,0,1000,1000,p.wall,"none");
 for(let i=0;i<6;i++){let xx=24+i*169;s+=rect(xx,80,150,875,p.ochre,p.ink,4,5);
   for(let j=0;j<8;j++){let yy=101+j*104;s+=line(xx+5,yy+79,xx+145,yy+79,p.ink,5);
     for(let k=0;k<6;k++)s+=book(xx+9+k*22,yy,17,76,[p.rose,p.accent,p.shadow,p.paper][(i+j+k)%4]);}
 }
 s+=path("M219 813 Q500 726 793 813 V1000 H219Z",p.paper,p.ink,5);
 s+=g("translate(205 704)",circ(0,-95,39,p.ochre,p.ink,4)+ellipse(0,0,50,85,p.accent,p.ink,4)+path("M-21 -23 L-105 -72 M30 -25 L111 -65 M-26 0 L-102 32 M35 5 L108 43 M-12 64 L-67 118 M17 64 L75 118","none",p.ink,10));
 s+=portalFrame("painting")+rect(317,768,370,132,p.paper,p.ink,7,5)+txt(500,823,"DE UITGANG IS",21)+txt(500,853,"UITGELEEND",21);
 s+=mouse(792,884,.7,-1,true)+mouse(109,925,.75,1);
 s+=dots(182,50);return s;
}
export function worldSvg(index:number){
 const palette=palettes[index%palettes.length];
 const graphic=index===0?desk():index===1?corridor():index===2?reception():index===3?coffeeCity():index===4?moonWorkshop():index===5?monsterVillage():index===6?godsOffice():index===7?village(index):index===8?library():village(index,true);
 return '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">'+
 '<defs><pattern id="papergrain" width="20" height="20" patternUnits="userSpaceOnUse">'+
 '<circle cx="3" cy="6" r=".65" fill="'+palette.ink+'" opacity=".13"/>'+
 '<circle cx="13" cy="15" r=".6" fill="'+palette.ink+'" opacity=".1"/></pattern></defs>'+
 graphic+rect(0,0,1000,1000,"url(#papergrain)","none",0,0)+edge()+'</svg>';
}
