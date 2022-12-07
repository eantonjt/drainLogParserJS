
const dlp = require('../drain');
const DrainLogParser = dlp.DrainLogParser


test('Add two equal loglines and see that they are equal to the template', () => {

    const drainSettings = 
    {
        'varMarker': '§',
        'DAGSplitMarker': '_',
        'numMarker': '*'
    }
    
    logParserDrain = new DrainLogParser(drainSettings)

    const inputLogline1 = 'This is my message'
    const inputLogline2 = 'This is my message'
    const expectedTemplate = 'This is my message'

    logParserDrain.addLogline(inputLogline1)
    logParserDrain.addLogline(inputLogline2)

    const inputTemplateGroupKey = '4_First:This_Group1'
    const observedTemplate = logParserDrain.logTemplateGroupStore[inputTemplateGroupKey]['Template']

    expect(observedTemplate).toBe(expectedTemplate);
});

test('Add two unequal but similar loglines and see that they end up in the same group', () => {

    const drainSettings = 
    {
        'varMarker': '§',
        'DAGSplitMarker': '_',
        'numMarker': '*'
    }
    
    logParserDrain = new DrainLogParser(drainSettings)

    const inputLogline1 = 'This is my message'
    const inputLogline2 = 'This is my dog'
    const expectedTemplate = 'This is my §'

    logParserDrain.addLogline(inputLogline1)
    logParserDrain.addLogline(inputLogline2)

    const inputTemplateGroupKey = '4_First:This_Group1'
    const observedTemplate = logParserDrain.logTemplateGroupStore[inputTemplateGroupKey]['Template']

    expect(observedTemplate).toBe(expectedTemplate);
});


test('Add two unequal but similar loglines, both starts with same number and see that they end up in the same group with variable markers', () => {

    const drainSettings = 
    {
        'varMarker': '§',
        'DAGSplitMarker': '_',
        'numMarker': '*'
    }
    
    logParserDrain = new DrainLogParser(drainSettings)

    const inputLogline1 = '555 is my message'
    const inputLogline2 = '555 loves my message'
    const expectedTemplate = '555 § my message'

    logParserDrain.addLogline(inputLogline1)
    logParserDrain.addLogline(inputLogline2)

    const inputTemplateGroupKey = '4_Last:message_Group1'
    const observedTemplate = logParserDrain.logTemplateGroupStore[inputTemplateGroupKey]['Template']

    expect(observedTemplate).toBe(expectedTemplate);
});


test('Add two unequal but similar loglines, both starts with different number and see that they end up in same group with variable markers', () => {

    const drainSettings = 
    {
        'varMarker': '§',
        'DAGSplitMarker': '_',
        'numMarker': '*'
    }
    
    logParserDrain = new DrainLogParser(drainSettings)

    const inputLogline1 = '555 is my message'
    const inputLogline2 = '777 loves my message'
    const expectedTemplate = '§ § my message'

    logParserDrain.addLogline(inputLogline1)
    logParserDrain.addLogline(inputLogline2)

    const inputTemplateGroupKey = '4_Last:message_Group1'
    const observedTemplate = logParserDrain.logTemplateGroupStore[inputTemplateGroupKey]['Template']

    expect(observedTemplate).toBe(expectedTemplate);
});

test('Add two different loglines and see that they give two different templates', () => {

    const drainSettings = 
    {
        'varMarker': '§',
        'DAGSplitMarker': '_',
        'numMarker': '*'
    }
    
    logParserDrain = new DrainLogParser(drainSettings)

    const inputLogline1 = 'I went to the store'
    const inputLogline2 = 'Where is my dog?'
    const expectedTemplate1 = 'I went to the store'
    const expectedTemplate2 = 'Where is my dog?'

    logParserDrain.addLogline(inputLogline1)
    logParserDrain.addLogline(inputLogline2)

    const inputTemplateGroupKey1 = '5_First:I_Group1'
    const observedTemplate1 = logParserDrain.logTemplateGroupStore[inputTemplateGroupKey1]['Template']
    
    const inputTemplateGroupKey2 = '4_First:Where_Group1'
    const observedTemplate2 = logParserDrain.logTemplateGroupStore[inputTemplateGroupKey2]['Template']

    expect(observedTemplate1).toBe(expectedTemplate1);
    expect(observedTemplate2).toBe(expectedTemplate2);
});

test('Add three different loglines, two similar and one dissimilar, and see that they give two different templates', () => {

    const drainSettings = 
    {
        'varMarker': '§',
        'DAGSplitMarker': '_',
        'numMarker': '*'
    }
    
    logParserDrain = new DrainLogParser(drainSettings)

    const inputLogline1 = 'I went to the store'
    const inputLogline2 = 'Where is my dog?'
    const inputLogline3 = 'Where is my cat?'
    const expectedTemplate1 = 'I went to the store'
    const expectedTemplate2 = 'Where is my §'

    logParserDrain.addLogline(inputLogline1)
    logParserDrain.addLogline(inputLogline2)
    logParserDrain.addLogline(inputLogline3)

    const inputTemplateGroupKey1 = '5_First:I_Group1'
    const observedTemplate1 = logParserDrain.logTemplateGroupStore[inputTemplateGroupKey1]['Template']
    
    const inputTemplateGroupKey2 = '4_First:Where_Group1'
    const observedTemplate2 = logParserDrain.logTemplateGroupStore[inputTemplateGroupKey2]['Template']

    expect(observedTemplate1).toBe(expectedTemplate1);
    expect(observedTemplate2).toBe(expectedTemplate2);
});


test('Add three different loglines, all similar but not similar enough for the same logtemplate, and see that they give two different templates', () => {

    const drainSettings = 
    {
        'varMarker': '§',
        'DAGSplitMarker': '_',
        'numMarker': '*'
    }
    
    logParserDrain = new DrainLogParser(drainSettings)

    const inputLogline1 = 'Where lives the lord?'
    const inputLogline2 = 'Where did you sleep?'
    const inputLogline3 = 'Where is my cat?'
    const expectedTemplate1 = 'Where lives the lord?'
    const expectedTemplate2 = 'Where did you sleep?'
    const expectedTemplate3 = 'Where is my cat?'

    logParserDrain.addLogline(inputLogline1)
    logParserDrain.addLogline(inputLogline2)
    logParserDrain.addLogline(inputLogline3)

    const inputTemplateGroupKey1 = '4_First:Where_Group1'
    const observedTemplate1 = logParserDrain.logTemplateGroupStore[inputTemplateGroupKey1]['Template']
    
    const inputTemplateGroupKey2 = '4_First:Where_Group2'
    const observedTemplate2 = logParserDrain.logTemplateGroupStore[inputTemplateGroupKey2]['Template']

    const inputTemplateGroupKey3 = '4_First:Where_Group3'
    const observedTemplate3 = logParserDrain.logTemplateGroupStore[inputTemplateGroupKey3]['Template']

    expect(observedTemplate1).toBe(expectedTemplate1);
    expect(observedTemplate2).toBe(expectedTemplate2);
    expect(observedTemplate3).toBe(expectedTemplate3);
});