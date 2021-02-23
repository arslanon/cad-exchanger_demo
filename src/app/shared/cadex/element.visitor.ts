
export class ElementVisitor extends cadex.ModelData_SceneGraphElementVisitor {

  constructor(theTextureBasePath) {
    super();
    this.info = 'Information\n';
    this.textureBasePath = theTextureBasePath;
  }

  async visitElement(theElement): Promise<void> {
    this.info += this.formatKeyValue('Uuid', theElement.uuid);
    this.info += this.formatKeyValue('Name', theElement.name || theElement.da?.name);
  }

  async visitPart(thePart): Promise<void> {
    await this.visitElement(thePart);
  }

  async visitInstanceEnter(theInstance): Promise<void> {
    await this.visitElement(theInstance);
    this.info += this.formatKeyValue('Transformation', theInstance.transformation.toString().replace(/\n/g, '; '));
  }

  async visitAssemblyEnter(theAssembly): Promise<void> {
    return this.visitElement(theAssembly);
  }

  formatKeyValue(theKey, theValue): string {
    if (String(theValue).indexOf('<') === -1) {
      theValue = `${theValue}`;
    }
    return `${theKey}: ${theValue}\n`;
  }
}
