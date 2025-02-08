import React from 'react'
import { render } from 'enzyme'
import BackgroundGrid from "../backgroundGrid"

describe('<BackgroundGrid />', () => {
    it('renders dot grid elements', () => {
        const wrapper = render(<svg>
                <BackgroundGrid type="dot" patternInstanceRef="testingRef"/>
            </svg>);

        const pattern = wrapper.find('.testingRef');
        const dot = wrapper.find('.testingRef rect');
        const bgRect = wrapper.find('#bgPatternContainer');

        expect(dot.length).toBe(1);
        expect(pattern.length).toBe(1);
        expect(bgRect.length).toBe(1);
    })

    it('renders line grid elements', () => {
        const wrapper = render(<svg>
                <BackgroundGrid type="line" patternInstanceRef="testingRef"/>
            </svg>);

        const pattern = wrapper.find('.testingRef');
        const lines = wrapper.find('.testingRef line');
        const bgRect = wrapper.find('#bgPatternContainer');
        
        expect(lines.length).toBe(2);
        expect(pattern.length).toBe(1);
        expect(bgRect.length).toBe(1);
    })

    it('applies backgroundGrid options to dot grid when specified', () => {
        const wrapper = render(<svg>
                <BackgroundGrid 
                    type="dot" 
                    color="red"
                    thickness={12}
                    gridCellSize={{width: 200, height: 400}}
                    patternInstanceRef="testingRef" 
                />
            </svg>);

        const pattern = wrapper.find('.testingRef');
        const dot = wrapper.find('.testingRef rect');
        
        expect(pattern[0].attribs.width).toBe('200');
        expect(pattern[0].attribs.height).toBe('400');
        expect(dot[0].attribs.fill).toBe('red');
        expect(dot[0].attribs.width).toBe('12');
        expect(dot[0].attribs.height).toBe('12');
        expect(dot[0].attribs.rx).toBe('12');
    })

    it('applies backgroundGrid options to line grid when specified', () => {
        const wrapper = render(<svg>
                <BackgroundGrid 
                    type="line" 
                    color="red"
                    thickness={12}
                    gridCellSize={{width: 200, height: 400}}
                    patternInstanceRef="testingRef" 
                />
            </svg>);

        const pattern = wrapper.find('.testingRef');
        const lines = wrapper.find('.testingRef line');
        
        expect(pattern[0].attribs.width).toBe('200');
        expect(pattern[0].attribs.height).toBe('400');
        expect(lines[0].attribs.stroke).toBe('red');
        expect(lines[0].attribs['stroke-width']).toBe('12');
        expect(lines[0].attribs.x2).toBe('200');
        expect(lines[1].attribs.stroke).toBe('red');
        expect(lines[1].attribs['stroke-width']).toBe('12');
        expect(lines[1].attribs.y2).toBe('400');
    })

    it('renders custom gridCellFunc when specified', () => {
        const wrapper = render(<svg>
            <BackgroundGrid 
                type="custom" 
                color="red"
                thickness={12}
                gridCellSize={{width: 200, height: 400}}
                gridCellFunc={(options) => {
                    return <circle 
                        r={options.gridCellSize.width/2} 
                        cx={options.gridCellSize.width/2} 
                        cy={options.gridCellSize.height/2} 
                        stroke={options.color} 
                        fill='none' 
                        strokeWidth={options.thickness}
                    />
                }}
                patternInstanceRef="testingRef" 
            />
        </svg>);

        const pattern = wrapper.find('.testingRef');
        const circle = wrapper.find('.testingRef circle');

        expect(circle.length).toBe(1);
        expect(pattern.length).toBe(1);
        expect(circle[0].attribs.r).toBe('100');
        expect(circle[0].attribs.cx).toBe('100');
        expect(circle[0].attribs.cy).toBe('200');
        expect(circle[0].attribs.stroke).toBe('red');
        expect(circle[0].attribs['stroke-width']).toBe('12');
    })
})