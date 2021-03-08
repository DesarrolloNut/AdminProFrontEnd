
export class TecladoLayOuts  {

    public static LayoutTecladoNumerico: any = {
        'default': [
            '1 2 3',
            '4 5 6',
            '7 8 9',
            '0 {bksp} {enter}',
        ]
    };

    public static LayoutTecladoAlfanumerico: any = {
        'default': [
            '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
            '{tab} q w e r t y u i o p [ ] \\',
            '{lock} a s d f g h j k l ; \' {enter}',
            '{shift} z x c v b n m , . / {shift}',
            '.com @ {space}'
        ],
        'shift': [
            '~ ! @ # $ % ^ & * ( ) _ + {bksp}',
            '{tab} Q W E R T Y U I O P { } |',
            '{lock} A S D F G H J K L : " {enter}',
            '{shift} Z X C V B N M < > ? {shift}',
            '.com @ {space}'
        ]
    };

    public static LayoutOrden: any = {
        'default': [
            '1 2 3 4 5 6 7 8 9 0 {bksp}',
            'Q W E R T Y U I O P',
            'A S D F G H J K L',
            'Z X C V B N M {enter}',
        ]
    };

      public static LayoutLetrasNumerosEspacio: any = {
        'default': [
            '1 2 3 4 5 6 7 8 9 0 {bksp}',
            'Q W E R T Y U I O P',
            'A S D F G H J K L',
            'Z X C V B N M {enter}',
            '{space}',
        ]
    };
    public static LayoutLetrasEspacio: any = {
        'default': [
            'Q W E R T Y U I O P',
            'A S D F G H J K L',
            'Z X C V B N M {bksp} {enter}',
            '{space}',
        ]
    };


}
