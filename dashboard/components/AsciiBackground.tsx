export const CreationOfAdamAscii = `
                                                                                                    
                                                                                                    
                                                                                                    
                                                       .:~!!77!~^.                                  
                                                    ^?PBBBBBBBG5P5J.                                
                                                  ~YGGPPPPPPPPPP5PPP?                               
                                        ..       !GPPPPPPPPPPPPPP55PP7                              
                                  .^~!77!^     .JP55555555PPPPPP555555!                             
                                 !YPP5PPPY!    7P5555YJ??77!7??JY55555P.                            
                               .JPG55555PP5:  :P55Y?!^.         .:^~!?YJ                            
                               !GPPPPPPPPPPY  ?5Y!:.                                                
                               ^GPPPPPPPPPP5^ YY~                                                   
                                :?5GPPPPPPP5J ??                                                    
                                  .^!7??JY555YJ.                                                    
                                         ...^::                                                     
                                                                                                    
                                                                                                    
                                                                                                    
                                         .^!?JY55PPPGGGGGPP5Y?!^.                                   
                                     :!J5GGBBBBBBBBBBBBBBGGGGGGG5?^                                 
                                  .!YGBBBBBBBBBBBBBBBBGGGGGGGGGGGGGJ.                               
                                 ^PBBBBBBBBBBBBBBBBBGGGGGGGGGGGGGGGG5.                              
                                .PBBBBBBBBBBBBBGGGPPGGGGGGGGGGGGGGGGGP:                             
                                YBBBBBBBBBBG5J!~^. .^!J5GGGGGGGGGGGGGGP.                            
                               !BBBBBBBBB5!^           .~?5GGGGGGGGGGGGP^                           
                              :GBBBBBBBBY.                .~JGGGGGGGGGGGG!                          
                              ?BBBBBBBBG:                    :?PGGGGGGGGGP.                         
                              YBBBBBBBBG^                      :7PGGGGGGGGP.                        
                              YBBBBBBBBBJ                        :YGGGGGGGGP:                       
                              !BBBBBBBBBB?                         ~5GGGGGGGG!                      
                               JBBBBBBBBBB?                         .JGGGGGGGG~                     
                                ~PBBBBBBBBBY:                         ~PGGGGGGG7                    
                                  !5GBBBBBBBG7.                        ^PGGGGGGG?                   
                                    .~?Y5PGBBBG?.                       :PGGGGGGGJ                  
                                          ..^!~^                         ^PGGGGGGPY.                
                                                                          :PGGGGGPPY.               
                                                                           ~GGGGGGPPJ               
                                                                            JGGGGGGPP?              
                                                                            .PGGGGGGPP!             
                                                                             JGGGGGGGPY.            
                                                                             ^GGGGGGGGPY            
                                                                             .GGGGGGGGGP~           
                                                                              YGGGGGGGGGP.          
                                                                              7GGGGGGGGGPY          
`;

export function AsciiBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-20">
      <pre className="text-[10px] md:text-[14px] leading-tight font-mono text-white/50 whitespace-pre select-none scale-150">
        {CreationOfAdamAscii}
      </pre>
    </div>
  );
}
