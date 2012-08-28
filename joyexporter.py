#!BPY

"""
Name: 'Objective-C Header (.h)'
Blender: 244
Group: 'Export'
Tooltip: 'Exports header file for use with the OpenGL ES template for iPhone available from http://iphonedevelopment.blogspot.com/'
"""
import Blender
from Blender import *
import bpy
import bpy
import os

        
def write_obj(filepath):    
    out = file(filepath, 'w')
    sce = bpy.data.scenes.active
    ob = sce.objects.active
    mesh = Mesh.New()        
    mesh.getFromObject(ob.name)

    editmode = Window.EditMode()
    if editmode: Window.EditMode(0)
    has_quads = False
    for f in mesh.faces:
        if len(f) == 4:
            has_quads = True
            break
    
    if has_quads:
        oldmode = Mesh.Mode()
        Mesh.Mode(Mesh.SelectModes['FACE'])
        
        mesh.sel = True
        tempob = sce.objects.new(mesh)
        mesh.quadToTriangle(0) # more=0 shortest length
        oldmode = Mesh.Mode(oldmode)
        sce.objects.unlink(tempob)
        
        Mesh.Mode(oldmode)
    
    objectname = ob.getData(True)
    basename = objectname.capitalize()

    out.write('[')
	
	for face in mesh.faces:
		for (vert) in zip(face.verts):
			out.write('{ x:*/{%f, %f, %f}, ' % (vert.co.x, vert.co.y, vert.co.z) )
			out.write('/*n:*/{%f, %f, %f}, ' % (vert.no.x, vert.no.y, vert.no.z))
			out.write('},\n')
	out.write('};\n\n')

    out.write('// glDisableClientState(GL_NORMAL_ARRAY);\n\n\n')
    
    out.close()


filename = os.path.splitext(Blender.Get('filename'))[0]
Blender.Window.FileSelector(write_obj, "Export", '%s.h' % filename)