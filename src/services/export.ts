import type { Group } from 'three'

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob),
    a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
export async function exportStadium(root: Group) {
  const { GLTFExporter } =
    await import('three/addons/exporters/GLTFExporter.js')
  root.updateMatrixWorld(true)
  const result = await new GLTFExporter().parseAsync(root, {
    binary: true,
    onlyVisible: false,
  })
  if (!(result instanceof ArrayBuffer)) throw new Error('Expected binary glTF')
  // Re-import before offering a file, verifying this exporter/loader pair preserves the roof.
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js')
  const imported = await new GLTFLoader().parseAsync(result, '')
  if (
    !imported.scene.getObjectByName(
      'Complete_roof_canopy_and_steel_structure',
    ) &&
    !imported.scene.getObjectByName('Complete roof canopy and steel structure')
  )
    throw new Error('Roof missing from export')
  const { disposeGroup } = await import('../scene/model/geometry')
  disposeGroup(imported.scene)
  return result
}
