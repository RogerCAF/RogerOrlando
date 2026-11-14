/* Original SVG storybook illustrations for Infinite Worlds.
   Everything is authored in vectors so it stays crisp, self-contained, and lightweight. */
export const WORLD_NAMES = [
  "Het sleutelgat", "De onmogelijke gang", "De zwevende vallei",
  "De tempel van het oog", "Het slapende monster", "Het kantoor van de goden",
  "De stad van nergens", "De bibliotheek van alles", "De wereld zonder rand"
] as const;

type Palette = { sky: string; floor: string; deep: string; dark: string; ink: string; gold: string; cream: string; accent: string; };
const PALETTES: Palette[] = [
  {sky:"#19283c",floor:"#6f605b",deep:"#101c30",dark:"#283248",ink:"#201f29",gold:"#d8b57f",cream:"#f4e3c5",accent:"#8ac2bd"},
  {sky:"#31415b",floor:"#b8957c",deep:"#243149",dark:"#47566f",ink:"#292c38",gold:"#e4c193",cream:"#f4e5cf",accent:"#86c5bc"},
  {sky:"#90b9b6",floor:"#a8cbb2",deep:"#4c797d",dark:"#406d70",ink:"#273e46",gold:"#f8d28b",cream:"#fbebd0",accent:"#b56c76"},
  {sky:"#443c68",floor:"#bd9a9a",deep:"#292d52",dark:"#55516d",ink:"#292a44",gold:"#f4c18c",cream:"#fff0d7",accent:"#91c9c6"},
  {sky:"#688a87",floor:"#7f9f88",deep:"#314b54",dark:"#52705d",ink:"#263e43",gold:"#f1c68b",cream:"#f0e5c4",accent:"#c7877a"},
  {sky:"#617ba4",floor:"#cbb1ae",deep:"#293d64",dark:"#506184",ink:"#263451",gold:"#ecc89a",cream:"#fff2d7",accent:"#c391d9"},
  {sky:"#e0b2a0",floor:"#bda88d",deep:"#48526a",dark:"#596475",ink:"#303346",gold:"#f6d3a4",cream:"#fff2d8",accent:"#82aaa2"},
  {sky:"#40546a",floor:"#9a725e",deep:"#293b50",dark:"#534659",ink:"#252837",gold:"#e9bd85",cream:"#f6e7ce",accent:"#90b8bd"},
  {sky:"#9cb9bb",floor:"#d5b799",deep:"#536d81",dark:"#647987",ink:"#283e4e",gold:"#edc68e",cream:"#f5e8ca",accent:"#b97981"}
];
const e = (s: string) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const R = (x:number,y:number,w:number,h:number,fill:string,stroke="none",rx=0,sw=2)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
const P = (d:string,fill:string,stroke="none",sw=3)=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round"/>';
const C = (x:number,y:number,r:number,fill:string,stroke="none",sw=3)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
const E = (x:number,y:number,rx:number,ry:number,fill:string,stroke="none",sw=3)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
const T = (x:number,y:number,s:string,size=19,fill="#283448",anchor="start",weight=600)=>'<text x="'+x+'" y="'+y+'" fill="'+fill+'" text-anchor="'+anchor+'" font-family="Georgia,serif" font-size="'+size+'" font-weight="'+weight+'" letter-spacing=".25">'+e(s)+'</text>';
const G=(transform:string,contents:string)=>'<g transform="'+transform+'">'+contents+'</g>';
const L=(x1:number,y1:number,x2:number,y2:number,stroke:string,width=2)=>'<path d="M'+x1+' '+y1+' L'+x2+' '+y2+'" stroke="'+stroke+'" stroke-width="'+width+'" stroke-linecap="round"/>';
function rand(seed:number){const a=Math.sin(seed*64.173+112.53)*10000;return a-Math.floor(a);}
function clouds(p:Palette,seed:number,n=16){let s="";for(let i=0;i<n;i++){const x=Math.round(rand(seed+i*37)*1060-30),y=Math.round(rand(seed+i*71+16)*690+80);const r=30+rand(seed+i*17)*65;s+=G("translate("+x+" "+y+")",E(0,0,r,15+r*.16,p.cream+"83")+E(r*.7,-7,r*.68,12+r*.15,p.cream+"60")+E(-r*.6,7,r*.55,10+r*.1,p.cream+"7d"));}return s;}
function stars(p:Palette,seed:number,count=55){let s="";for(let i=0;i<count;i++){const x=Math.round(rand(seed+i*23)*1000),y=Math.round(rand(seed+i*31+4)*770),r=i%7===0?3:1.2;s+=C(x,y,r,p.cream+(i%3===0?"c5":"75"));if(i%17===0)s+=L(x-8,y,x+8,y,p.gold+"a2",1)+L(x,y-8,x,y+8,p.gold+"a2",1);}return s;}
function plant(x:number,y:number,scale:number,p:Palette,seed:number){let s=P("M0 0 Q-8 -30 -5 -78 M0 -8 Q18 -38 30 -46 M-3 -32 Q-28 -54 -29 -68","none",p.ink,3);for(let i=0;i<8;i++){const dir=i%2?-1:1;const yy=-13-i*9;const xx=dir*(9+i*1.4);s+=E(xx,yy,8+i%3*2,4,p.accent,p.ink,1.3);}return G("translate("+x+" "+y+") scale("+scale+")",s);}
function windowArt(x:number,y:number,p:Palette,seed:number){const glow=rand(seed)>0.5?p.gold:p.accent;return G("translate("+x+" "+y+")",R(-13,-23,26,42,glow,p.ink,12,2.5)+L(0,-20,0,18,p.ink,2)+L(-12,0,12,0,p.ink,2));}
function roof(x:number,y,w:number,h:number,p:Palette,seed:number){return G("translate("+x+" "+y+")",P("M"+(-w/2)+" 0 Q-9 "+(-h-13)+" 0 "+(-h)+" Q18 "+(-h-20)+" "+(w/2)+" 0 Z",seed%2?p.accent:p.gold,p.ink,4)+R(-w*.42,0,w*.84,h*.92,p.cream,p.ink,3,3)+windowArt(-w*.18,h*.44,p,seed)+windowArt(w*.17,h*.44,p,seed+9)+R(-13,h*.66,26,h*.27,p.dark,p.ink,4,2));}
function sign(x:number,y,w:number,label:string,p:Palette,rotation=0){return G("translate("+x+" "+y+") rotate("+rotation+")",P("M0 0 L0 30","none",p.ink,3)+R(-w/2,-24,w,34,p.cream,p.ink,6,2.5)+T(0,-2,label,Math.min(17,440/(label.length+5)),p.ink,"middle",700));}
function book(x:number,y,w:number,h:number,color:string,p:Palette){return G("translate("+x+" "+y+")",R(0,0,w,h,color,p.ink,3,2)+R(4,3,4,h-6,p.gold,p.ink,2,1)+L(12,h*.2,w-5,h*.2,p.cream,1)+L(12,h*.3,w-8,h*.3,p.cream,1));}
function frame(p:Palette,seed:number,mode="circle"){let s='';if(mode==="keyhole"){s+=P("M500 390 C444 390 419 432 419 476 C419 513 442 535 459 546 L442 628 Q500 644 558 628 L541 546 C559 529 581 505 581 476 C581 431 556 390 500 390 Z",p.deep,p.gold,14);s+=P("M500 408 C454 408 439 445 439 478 C439 513 468 536 478 543 L465 610 Q500 620 535 610 L522 543 C540 526 562 510 562 478 C562 441 539 408 500 408 Z",p.ink,p.cream+"6a",3);}else if(mode==="eye"){s+=E(500,500,125,76,p.cream,p.ink,12)+C(500,500,88,p.gold,p.ink,7)+C(500,500,77,p.deep,p.gold,4);}else if(mode==="book"){s+=P("M385 400 Q441 372 500 417 Q560 368 615 400 L607 606 Q546 592 500 622 Q452 590 393 606 Z",p.cream,p.ink,10)+P("M500 420 L500 612","none",p.gold,5);}else if(mode==="window"){s+=P("M418 612 L418 460 Q418 375 500 375 Q582 375 582 460 L582 612 Z",p.dark,p.gold,13)+P("M434 595 L434 463 Q434 394 500 394 Q566 394 566 463 L566 595 Z",p.deep,p.cream+"60",2);}else if(mode==="clock"){s+=C(500,500,119,p.gold,p.ink,13)+C(500,500,101,p.cream,p.ink,3)+C(500,500,89,p.deep,p.gold,7);}else{s+=C(500,500,113,p.gold,p.ink,10)+C(500,500,97,p.deep,p.cream+"ba",4);}return s;}
function base(p:Palette,seed:number){return R(0,0,1000,1000,"url(#sky)")+R(0,0,1000,1000,"url(#grain)", "none")+stars(p,seed,34);}
function scene0(p:Palette){let s=base(p,11);
  // A single grand storybook door with calm margins, fine etching and ivy.
  s+=P("M0 760 Q230 712 390 745 Q660 695 1000 755 L1000 1000 H0 Z",p.floor,p.ink,4);
  for(let i=0;i<28;i++){const x=i%7*154-70,y=Math.floor(i/7)*244+44;s+=P("M"+x+" "+y+" Q"+(x+90)+" "+(y+12)+" "+(x+152)+" "+y,"none",p.cream+"24",3);}
  s+=P("M198 868 L198 240 Q198 74 500 68 Q802 72 802 240 L802 868 Z",p.dark,p.ink,17);
  s+=P("M226 842 L226 250 Q226 102 500 99 Q774 102 774 250 L774 842 Z", "url(#wood)",p.gold,12);
  s+=P("M252 809 L252 246 Q252 127 500 125 Q747 130 748 246 L748 809 Z","none",p.ink+"a8",5);
  for(let i=0;i<9;i++){const x=270+i*58;s+=L(x,220,x,805,p.ink+"50",2);s+=C(x,245,3,p.gold);s+=C(x,770,3,p.gold);}
  for(let i=0;i<24;i++){const a=i*Math.PI*2/24;const x=500+280*Math.sin(a),y=380-295*Math.cos(a);if(y>115 && y<825)s+=C(Math.round(x),Math.round(y),3,p.gold+"a8");}
  s+=C(500,495,146,p.gold,p.ink,15)+C(500,495,134,p.deep,p.cream,4)+frame(p,1,"keyhole");
  s+=P("M150 58 Q155 240 237 310 Q165 364 131 508 Q106 640 152 763","none",p.ink,9);
  s+=plant(144,542,1.5,p,1)+plant(839,701,1.7,p,8)+plant(214,858,1.9,p,3);
  s+=G("translate(286 760)",P("M0 0 Q-49 -17 -68 17 Q-88 40 -50 55 L-7 42 Z",p.cream,p.ink,3)+C(-42,13,3,p.ink)+T(-39,66,"...",15,p.cream));
  s+=sign(276,897,382,"NIET ELKE DEUR WIL OPEN",p,-3);
  s+=T(500,52,"DE DEUR TUSSEN WERELDEN",23,p.cream,"middle",500);
  s+=C(729,495,22,p.gold,p.ink,4)+C(729,495,8,p.ink);
  return s;
}
function scene1(p:Palette){let s=base(p,44);
  s+=P("M0 0 L1000 0 L670 330 L330 330 Z",p.dark,p.ink,6);
  s+=P("M0 0 L330 330 L330 720 L0 1000 Z",p.floor,p.ink,7);
  s+=P("M1000 0 L670 330 L670 720 L1000 1000 Z",p.accent,p.ink,7);
  s+=P("M0 1000 L330 720 L670 720 L1000 1000 Z",p.cream,p.ink,6);
  for(let i=0;i<10;i++){const d=i*44;s+=L(d,1000,385+(i-5)*22,700,p.ink+"65",2);s+=L(1000-d,1000,615-(i-5)*22,700,p.ink+"65",2);}
  for(let i=0;i<7;i++){const y=770+i*31;s+=L(0,y,1000,y,p.ink+"45",1.5);}
  s+=G("translate(210 385) rotate(-8)",R(-92,-118,184,228,p.gold,p.ink,8,7)+R(-76,-102,152,196,p.deep,p.cream,2,3)+C(0,-10,41,p.accent,p.gold,4)+T(0,59,"DE ZEE",17,p.cream,"middle"));
  s+=G("translate(814 390) rotate(7)",R(-83,-103,166,205,p.gold,p.ink,8,7)+R(-68,-89,136,175,p.deep,p.cream,2,3)+P("M-56 57 L-15 -18 L32 41 L59 8 L59 76 H-56 Z",p.accent,p.ink,3));
  for(let i=0;i<3;i++){const x=410+i*90;s+=L(x,-10,x,135,p.ink,4)+C(x,142,16,p.gold,p.ink,4)+C(x,142,7,p.cream);}
  s+=P("M310 785 Q363 724 422 768 Q465 719 499 764 Q548 704 597 764 Q633 721 691 781", "none",p.ink+"70",7);
  s+=G("translate(225 835)",E(0,0,85,31,p.ink)+C(51,-30,34,p.ink)+P("M-67 -2 Q-127 -58 -119 -105","none",p.ink,13)+P("M36 -62 L42 -102 L62 -67 M62 -62 L82 -101 L87 -49",p.ink,p.ink,3)+C(54,-35,4,p.gold)+C(74,-35,4,p.gold)+L(55,-22,69,-20,p.cream,2));
  s+=sign(744,795,335,"DE UITGANG IS MET PAUZE",p,4);
  s+=frame(p,22,"window");
  s+=T(500,155,"GANG 02 / DE TIJD LOOPT TERUG",19,p.cream,"middle");
  return s;
}
function scene2(p:Palette){let s=base(p,91)+clouds(p,38,9);
  s+=C(819,186,91,p.gold,p.cream,3);
  s+=P("M-50 595 Q153 327 284 530 Q383 371 515 492 Q673 300 840 510 Q900 430 1050 560 L1050 1000 H-50 Z",p.deep,p.ink,6);
  s+=P("M-20 747 Q160 575 297 705 Q479 519 598 700 Q826 535 1030 750 L1030 1000 H-20 Z",p.dark,p.ink,5);
  for(let i=0;i<9;i++){const x=rand(i*17+8)*970,y=270+rand(i*66+9)*430,sz=30+rand(i*35)*74;s+=G("translate("+x+" "+y+")",E(0,0,sz*1.5,sz*.38,p.floor,p.ink,4)+P("M"+(-sz*1.3)+" 0 Q0 "+(sz*2)+" "+(sz*1.3)+" 0 Z",p.deep,p.ink,3)+E(-sz*.24,-sz*.25,sz*.65,sz*.25,p.accent));}
  s+=P("M140 500 Q230 430 312 498 L312 535 Q240 550 140 533 Z",p.floor,p.ink,4);
  s+=G("translate(220 430) scale(.62)",roof(0,0,142,90,p,9)+roof(120,12,90,67,p,7));
  s+=P("M670 533 Q755 479 854 531 L850 575 Q755 591 660 572 Z",p.floor,p.ink,4);
  s+=G("translate(739 480) scale(.7)",roof(0,0,128,99,p,6));
  s+=P("M120 642 Q251 580 391 663 Q481 606 548 634 Q711 572 848 636","none",p.gold,12);
  s+=P("M145 643 Q251 584 391 661 Q480 614 548 640 Q701 577 848 637","none",p.ink,2);
  s+=P("M116 668 Q230 619 331 684","none",p.cream+"7a",4);
  s+=P("M766 548 Q752 673 735 801 Q718 884 681 1000 L805 1000 Q812 781 788 546 Z",p.cream,p.accent,4);
  s+=sign(283,783,350,"MAX 2 DRAKEN TEGELIJK",p,-4);
  s+=G("translate(829 260)",P("M0 0 Q63 -67 106 -21 Q73 -30 59 -3 Q43 7 29 23 Z",p.ink,p.ink,4)+C(24,1,7,p.gold)+P("M-12 18 Q-61 59 -81 23","none",p.ink,9));
  s+=frame(p,3);
  s+=T(500,110,"DE ZWEVENDE VALLEI",31,p.cream,"middle",500);
  return s;
}
function scene3(p:Palette){let s=base(p,121)+clouds(p,108,8);
  s+=P("M0 790 Q500 620 1000 790 V1000 H0 Z",p.floor,p.ink,6);
  s+=P("M155 760 V230 Q500 34 845 230 V760 Z",p.dark,p.ink,13);
  s+=P("M190 760 V255 Q500 70 810 255 V760 Z",p.deep,p.gold,7);
  for(let i=0;i<6;i++){const x=178+i*126;s+=R(x,310,28,475,p.cream,p.ink,10,5)+R(x-15,300,58,24,p.gold,p.ink,4,3)+R(x-13,767,54,23,p.gold,p.ink,4,2);}
  s+=P("M280 300 Q500 159 720 300","none",p.gold,18);
  s+=C(500,260,48,p.gold,p.ink,5)+T(500,273,"☼",48,p.ink,"middle");
  s+=P("M0 836 L1000 836 M0 892 L1000 892 M0 947 L1000 947","none",p.ink+"80",5);
  s+=G("translate(215 724)",P("M-33 -2 L-21 -110 L0 -144 L23 -109 L35 1 Z",p.cream,p.ink,5)+C(0,-162,23,p.cream,p.ink,5)+C(-7,-165,3,p.ink)+C(9,-165,3,p.ink));
  s+=G("translate(785 720)",P("M-33 -2 L-21 -110 L0 -144 L23 -109 L35 1 Z",p.cream,p.ink,5)+C(0,-162,23,p.cream,p.ink,5));
  for(let i=0;i<10;i++){const x=100+i*87;s+=P("M"+x+" 820 Q"+(x-15)+" 783 "+x+" 759 Q"+(x+15)+" 789 "+x+" 820 Z",p.gold,p.ink,3);}
  s+=E(500,502,160,110,p.cream,p.ink,15)+E(500,500,132,88,p.gold,p.ink,9);
  s+=frame(p,4,"eye");
  s+=sign(500,913,295,"JA, HET KIJKT TERUG",p,1);
  return s;
}
function scene4(p:Palette){let s=base(p,169)+clouds(p,67,15);
  s+=P("M0 703 Q220 582 432 704 Q709 542 1000 689 V1000 H0 Z",p.floor,p.ink,6);
  s+=P("M-20 850 Q240 770 424 856 Q666 720 1020 844 V1000 H-20 Z",p.accent,p.ink,4);
  s+=E(500,600,360,278,p.dark,p.ink,12)+E(490,620,314,223,p.floor,p.ink,5);
  s+=P("M248 467 Q265 318 349 331 Q394 350 404 390 L580 390 Q649 308 717 342 Q780 408 752 480",p.dark,p.ink,13);
  s+=P("M275 450 Q312 418 359 461 M640 460 Q690 414 732 458","none",p.ink,12);
  s+=E(500,563,62,38,p.accent,p.ink,5);
  s+=P("M398 632 Q500 682 598 630","none",p.ink,9);
  s+=C(346,547,12,p.accent,p.ink,3)+C(651,546,12,p.accent,p.ink,3);
  for(let i=0;i<8;i++){const x=230+i*73;s+=G("translate("+x+" "+(520-Math.sin(i*.8)*100)+") scale(.35)",roof(0,0,148,110,p,i+2));}
  for(let i=0;i<6;i++){const x=130+i*150;s+=plant(x,901,1.4,p,i);}
  s+=G("translate(146 728)",P("M0 0 Q26 -49 54 0 Q54 40 10 40 Z",p.gold,p.ink,4)+C(30,3,3,p.ink)+C(43,3,3,p.ink));
  s+=frame(p,5,"clock");
  s+=sign(499,941,345,"SST. MORGEN VERGADERING",p,-2);
  return s;
}
function scene5(p:Palette){let s=base(p,221)+clouds(p,40,18);
  s+=P("M0 730 Q167 649 341 725 Q516 615 673 726 Q845 651 1000 737 V1000 H0 Z",p.cream,p.ink,5);
  s+=P("M110 877 L245 652 L399 877 Z",p.floor,p.ink,5)+P("M617 864 L793 605 L950 864 Z",p.floor,p.ink,5);
  s+=G("translate(259 570)",E(0,0,91,128,p.accent,p.ink,7)+C(0,-167,65,p.gold,p.ink,6)+P("M-70 -158 Q0 -276 70 -158","none",p.cream,13)+C(-20,-178,5,p.ink)+C(20,-178,5,p.ink)+P("M-15 -129 Q0 -119 17 -128","none",p.ink,4)+P("M-66 -63 Q-173 -67 -166 12","none",p.ink,22)+P("M72 -68 Q165 -84 191 -9","none",p.ink,22));
  s+=G("translate(767 590)",E(0,0,83,117,p.accent,p.ink,7)+C(0,-156,62,p.cream,p.ink,6)+P("M-69 -160 L-42 -245 L-10 -183 L22 -248 L64 -164",p.gold,p.ink,5)+C(-17,-164,5,p.ink)+C(17,-164,5,p.ink)+P("M-20 -127 L20 -127","none",p.ink,4)+P("M-73 -41 Q-159 7 -167 -12","none",p.ink,21));
  s+=G("translate(730 333)",C(0,0,78,p.gold,p.ink,5)+E(0,0,90,19,"none",p.cream,5)+E(0,0,104,29,"none",p.ink,2)+C(-23,-12,15,p.cream+"88"));
  s+=G("translate(307 246)",C(0,0,57,p.accent,p.ink,5)+E(0,0,80,19,"none",p.gold,6));
  s+=R(357,747,284,100,p.cream,p.ink,12,6)+T(500,787,"UNIVERSUM STATUS:",21,p.ink,"middle")+T(500,824,"BIJNA ONLINE",26,p.ink,"middle",700);
  s+=frame(p,6);
  s+=sign(499,945,420,"IT-AFDELING: 1 WERKDAG",p);
  return s;
}
function scene6(p:Palette,seed=9){let s=base(p,321+seed)+clouds(p,seed*10,8);
  s+=C(820,150,80,p.gold,p.cream,3);
  s+=P("M0 674 Q255 598 480 658 Q751 583 1000 685 V1000 H0 Z",p.floor,p.ink,5);
  s+=P("M0 814 Q245 741 500 822 Q725 757 1000 800","none",p.cream,40);
  s+=P("M0 814 Q245 741 500 822 Q725 757 1000 800","none",p.ink,3);
  for(let i=0;i<15;i++){const x=35+(i%5)*215+((Math.floor(i/5)%2)*55),y=420+Math.floor(i/5)*185+(rand(seed+i*19)-.5)*55,sc=.48+rand(i*33+seed)*.35;s+=G("translate("+x+" "+y+") scale("+sc+")",roof(0,0,148,135,p,i+seed));}
  s+=G("translate(92 855)",roof(0,0,205,135,p,1));
  s+=G("translate(859 899)",roof(0,0,194,130,p,2));
  for(let i=0;i<14;i++){const x=rand(seed+i*12)*950,y=695+rand(seed+i*33)*250;s+=G("translate("+Math.round(x)+" "+Math.round(y)+")",C(0,-18,8,i%2?p.cream:p.gold,p.ink,1.5)+P("M0 -10 L0 13 M0 -2 L-9 7 M0 -2 L9 6 M0 13 L-7 25 M0 13 L8 24","none",p.ink,2));}
  s+=sign(155,703,280,"DRAKENVERZEKERING",p,5);
  s+=sign(777,717,288,"MORGEN GISTEREN OPEN",p,-4);
  s+=frame(p,seed,"window");
  return s;
}
function scene7(p:Palette){let s=base(p,454);
  s+=P("M0 0 H1000 V1000 H0 Z","url(#wood)",p.ink,9);
  for(let i=0;i<6;i++){const x=37+i*179;s+=R(x,20,147,955,p.dark,p.ink,8,6);for(let j=0;j<7;j++){const y=52+j*130;s+=R(x+6,y,135,10,p.gold,p.ink,2,2);for(let k=0;k<6;k++){const bx=x+9+k*22;s+=book(bx,y-82,17,76,[p.accent,p.cream,p.floor,p.gold][(i+j+k)%4],p);}}}
  s+=P("M242 795 Q272 680 356 740 L366 934 H212 Z",p.accent,p.ink,6);
  s+=G("translate(285 714)",C(0,0,50,p.gold,p.ink,5)+C(-15,-6,4,p.ink)+C(13,-6,4,p.ink)+P("M-17 21 Q0 35 18 21","none",p.ink,3));
  for(let i=0;i<6;i++){const a=i*Math.PI/3,yy=790+i*10,ex=285+Math.cos(a)*115;s+=P("M285 "+(yy-45)+" Q"+ex+" "+(yy-100)+" "+ex+" "+(yy+20),"none",p.ink,13)+C(ex,yy+20,11,p.gold,p.ink,3);}
  s+=P("M355 775 L645 775 L630 955 L370 955 Z",p.cream,p.ink,6);
  s+=frame(p,8,"book");
  s+=sign(503,913,350,"HOE STOP IK MET ZOOMEN?",p,-3);
  s+=T(500,113,"DE BIBLIOTHEEK VAN ALLES",27,p.cream,"middle");
  return s;
}
function openWorld(p:Palette,seed:number){let s=base(p,seed*51)+clouds(p,seed*23,17);
  s+=C(831,179,71,p.gold,p.cream,3);
  s+=P("M-20 480 Q200 314 375 503 Q600 325 1020 488 L1020 1000 H-20 Z",p.deep,p.ink,5);
  s+=P("M0 615 Q240 484 490 588 Q733 455 1000 610 V1000 H0 Z",p.floor,p.ink,6);
  s+=P("M0 833 Q210 715 461 808 Q743 714 1000 811 V1000 H0 Z",p.accent,p.ink,6);
  // Distinct neighborhoods, tiny shops and wandering citizens.
  const patterns=seed%4;
  for(let i=0;i<26;i++){const x=45+(i%7)*144+Math.sin(i*11+seed)*22;
    const y=300+Math.floor(i/7)*150+(i%3)*15;
    const sc=.29+rand(seed*11+i)*.24;
    if(Math.abs(x-500)<190 && Math.abs(y-500)<195)continue;
    s+=G("translate("+Math.round(x)+" "+Math.round(y)+") scale("+sc+")",roof(0,0,150,122,p,seed+i));
  }
  if(patterns===0){for(let i=0;i<7;i++){const x=i*159+20;s+=plant(x,830,1.2,p,i);}}
  if(patterns===1){for(let i=0;i<10;i++){const x=i*107+5;s+=G("translate("+x+" 859)",E(0,0,39,18,p.cream,p.ink,3)+P("M-3 -20 Q-18 -86 -25 -89","none",p.ink,5));}}
  if(patterns===2){for(let i=0;i<7;i++){const x=i*151+15;s+=G("translate("+x+" 888)",P("M-20 0 Q-40 -90 -3 -107 Q41 -87 20 0",p.gold,p.ink,3)+C(0,-72,9,p.ink));}}
  if(patterns===3){for(let i=0;i<8;i++){const x=i*131+15;s+=G("translate("+x+" 870)",E(0,0,45,13,p.cream,p.ink,3)+C(0,-35,28,p.accent,p.ink,4));}}
  for(let i=0;i<30;i++){const x=rand(seed*200+i*15)*950,y=630+rand(seed*40+i*39)*325;if(x>370&&x<630&&y<685)continue;
    s+=G("translate("+Math.round(x)+" "+Math.round(y)+") scale(.72)",C(0,-18,8,p.cream,p.ink,2)+P("M0 -10 L0 18 M0 0 L-10 8 M0 0 L10 8 M0 18 L-9 28 M0 18 L9 28","none",p.ink,3));}
  const jokes=["AFSLAG NERGENS","TIJD IS EEN MENING","MORGEN GISTEREN OPEN","ZOEK JE DE UITGANG?","HEEL VER VAN HIER","DE DRAAK IS MET PAUZE","GELIEVE NIET TE VALLEN","WELKOM TERUG, DENK IK"];
  s+=sign(215,732,310,jokes[seed%jokes.length],p,-3);
  s+=sign(775,809,330,jokes[(seed+3)%jokes.length],p,4);
  s+=G("translate(122 252)",P("M-38 11 Q-4 -39 38 11 Z",p.cream,p.ink,3)+C(-12,-7,4,p.ink)+C(11,-7,4,p.ink)+P("M-11 7 Q0 17 11 7","none",p.ink,2));
  s+=frame(p,seed,seed%3===0?"window":seed%3===1?"clock":"circle");
  s+=T(500,98,"DE WERELD ZONDER RAND  ·  "+String(seed).padStart(3,"0"),26,p.cream,"middle");
  return s;
}
export function sceneTitle(index:number){return index<WORLD_NAMES.length?WORLD_NAMES[index]:"De wereld zonder rand · "+String(index-7).padStart(3,"0");}
export type Aperture = "keyhole"|"window"|"circle"|"eye"|"clock"|"book";
export function apertureFor(index:number):Aperture {
 if(index===0)return "keyhole";
 if(index===1||index===6||index>=8&&index%3===0)return "window";
 if(index===3)return "eye";
 if(index===4||index>=8&&index%3===1)return "clock";
 if(index===7)return "book";
 return "circle";
}
export function sceneSvg(index:number){
 const p=PALETTES[index<8?index:8+(Math.floor((index-8)/3)%1) % PALETTES.length] ?? PALETTES[8];
 const palette=index<=8?p:PALETTES[2+((index-8)%7)];
 const graphic=index===0?scene0(palette):index===1?scene1(palette):index===2?scene2(palette):index===3?scene3(palette):index===4?scene4(palette):index===5?scene5(palette):index===6?scene6(palette):index===7?scene7(palette):openWorld(palette,index-7);
 // Fine linework, watercolor light and restrained paper grain give the worlds a cohesive illustrated feel.
 return '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">'+
 '<defs>'+
 '<linearGradient id="sky" x1="0" x2=".6" y1="0" y2="1"><stop offset="0" stop-color="'+palette.sky+'"/><stop offset="1" stop-color="'+palette.deep+'"/></linearGradient>'+
 '<linearGradient id="wood" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="'+palette.floor+'"/><stop offset=".55" stop-color="'+palette.dark+'"/><stop offset="1" stop-color="'+palette.floor+'"/></linearGradient>'+
 '<radialGradient id="grain"><stop offset="0" stop-color="'+palette.cream+'" stop-opacity=".08"/><stop offset=".72" stop-color="'+palette.cream+'" stop-opacity="0"/><stop offset="1" stop-color="'+palette.ink+'" stop-opacity=".25"/></radialGradient>'+
 '</defs>'+graphic+
 '<rect x="8" y="8" width="984" height="984" rx="24" fill="none" stroke="'+palette.ink+'" stroke-width="14"/>'+
 '<rect x="20" y="20" width="960" height="960" rx="18" fill="none" stroke="'+palette.cream+'" stroke-opacity=".35" stroke-width="2"/>'+
 '</svg>';
}
