const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI;
};

const isCapacitor = () => {
  return typeof window !== 'undefined' && window.Capacitor;
};

export const fileSystem = {
  async selectFolder() {
    if (isElectron()) {
      return await window.electronAPI.selectFolder();
    }
    if (isCapacitor()) {
      const { Filesystem } = await import('@capacitor/filesystem');
      const { Directory } = Filesystem;
      try {
        const result = await Filesystem.requestPermissions();
        if (result.granted) {
          return Directory.Documents;
        }
      } catch (e) {
        console.warn('Permission request failed:', e);
      }
      return null;
    }
    return null;
  },

  async readFile(filePath) {
    if (isElectron()) {
      const buffer = await window.electronAPI.readFile(filePath);
      return new Uint8Array(buffer);
    }
    if (isCapacitor()) {
      const { Filesystem } = await import('@capacitor/filesystem');
      const contents = await Filesystem.readFile({ path: filePath });
      const binary = atob(contents.data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }
    return null;
  },

  async writeFile(filePath, content, fileName) {
    if (isElectron()) {
      return await window.electronAPI.saveFile({
        fileName,
        content: Array.from(content),
        filePath
      });
    }
    if (isCapacitor()) {
      const { Filesystem } = await import('@capacitor/filesystem');
      const base64 = btoa(String.fromCharCode(...content));
      await Filesystem.writeFile({
        path: `${filePath}/${fileName}`,
        data: base64,
        encoding: Filesystem.Encoding.Base64
      });
      return `${filePath}/${fileName}`;
    }
    return null;
  },

  async listDirectory(dirPath) {
    if (isElectron()) {
      return await window.electronAPI.listDirectory(dirPath);
    }
    if (isCapacitor()) {
      const { Filesystem } = await import('@capacitor/filesystem');
      const result = await Filesystem.readdir({ path: dirPath });
      return result.files;
    }
    return [];
  },

  async createDirectory(dirPath) {
    if (isElectron()) {
      return await window.electronAPI.createDirectory(dirPath);
    }
    if (isCapacitor()) {
      const { Filesystem } = await import('@capacitor/filesystem');
      await Filesystem.mkdir({ path: dirPath, recursive: true });
      return true;
    }
    return false;
  },

  async deleteFile(filePath) {
    if (isElectron()) {
      return await window.electronAPI.deleteFile(filePath);
    }
    if (isCapacitor()) {
      const { Filesystem } = await import('@capacitor/filesystem');
      await Filesystem.deleteFile({ path: filePath });
      return true;
    }
    return false;
  },

  async moveFile(src, dest) {
    if (isElectron()) {
      return await window.electronAPI.moveFile({ src, dest });
    }
    if (isCapacitor()) {
      const { Filesystem } = await import('@capacitor/filesystem');
      await Filesystem.rename({ from: src, to: dest });
      return true;
    }
    return false;
  },

  async getAppPath() {
    if (isElectron()) {
      return await window.electronAPI.getAppPath();
    }
    if (isCapacitor()) {
      const { Filesystem } = await import('@capacitor/filesystem');
      return Filesystem.documentsDirectory || Filesystem.cacheDirectory;
    }
    return '';
  },

  async copyFile(src, dest) {
    if (isElectron()) {
      const content = await this.readFile(src);
      return await this.writeFile(dest, content, dest.split('/').pop());
    }
    if (isCapacitor()) {
      const { Filesystem } = await import('@capacitor/filesystem');
      await Filesystem.copy({ from: src, to: dest });
      return true;
    }
    return false;
  },

  async fileExists(filePath) {
    if (isElectron()) {
      try {
        const fs = await import('fs');
        return fs.existsSync(filePath);
      } catch {
        return false;
      }
    }
    if (isCapacitor()) {
      const { Filesystem } = await import('@capacitor/filesystem');
      try {
        await Filesystem.stat({ path: filePath });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
};

export const archive = {
  async createZip(files, outputPath, outputFileName) {
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();

    for (const file of files) {
      if (file.content) {
        zip.file(file.name, file.content);
      }
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const buffer = await blob.arrayBuffer();

    await fileSystem.writeFile(outputPath, new Uint8Array(buffer), outputFileName);

    return `${outputPath}/${outputFileName}`;
  },

  async extractZip(zipPath, outputPath) {
    if (isElectron()) {
      const fs = await import('fs');
      const { default: JSZip } = await import('jszip');
      const data = fs.readFileSync(zipPath);
      const zip = await JSZip.loadAsync(data);

      await fileSystem.createDirectory(outputPath);

      for (const [name, file] of Object.entries(zip.files)) {
        if (!file.dir) {
          const content = await file.async('uint8array');
          await fileSystem.writeFile(outputPath, content, name);
        }
      }
      return true;
    }
    if (isCapacitor()) {
      const { Filesystem } = await import('@capacitor/filesystem');
      const { default: JSZip } = await import('jszip');
      const contents = await Filesystem.readFile({ path: zipPath });
      const binary = atob(contents.data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const zip = await JSZip.loadAsync(bytes);

      await fileSystem.createDirectory(outputPath);

      for (const [name, file] of Object.entries(zip.files)) {
        if (!file.dir) {
          const content = await file.async('uint8array');
          await fileSystem.writeFile(outputPath, content, name);
        }
      }
      return true;
    }
    return false;
  }
};

export default { fileSystem, archive };
