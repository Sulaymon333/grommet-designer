
export const welcome = {
  name: 'Welcome',
  screens: { 1: { id: 1, root: 2 } },
  screenOrder: [1],
  components: {
    2: { id: 2, type: 'Grommet', props: { style: { height: '100vh'} }, children: [3] },
    3: { id: 3, type: 'Box', props: { align: 'center', justify: 'center', pad: 'small', fill: 'vertical', background: 'brand'}, children: [4,7,5] },
    4: { id: 4, type: 'Heading', props: { size: 'large', margin: 'none' }, text: 'Designer' },
    5: { id: 5, type: 'Box', props: { align: 'center', justify: 'between', pad: 'small', direction: 'row', alignSelf: 'stretch'}, children: [8,10] },
    6: { id: 6, type: 'Icon', props: { icon: 'LinkPrevious'} },
    7: { id: 7, type: 'Paragraph', props:{ size: 'xlarge' }, text: 'Design using real grommet components!'},
    8: { id: 8, type: 'Box', props: { align: 'center', justify: 'center', pad: 'small', direction: 'row', gap: 'small' }, children: [6,9] },
    9: { id: 9, type: 'Text', props: {}, text: 'add components' },
    10: { id: 10, type: 'Box', props: { align: 'center', justify: 'center', pad: 'small', direction: 'row', gap: 'small' }, children: [11,12] },
    11: { id: 11, type: 'Text', props: {}, text: 'describe components' },
    12: { id: 12, type: 'Icon', props: { icon: 'LinkNext'} },
  },
};
