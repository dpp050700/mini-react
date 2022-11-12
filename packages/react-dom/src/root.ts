export function createRoot(container: any) {
  return {
    render() {
      console.log(container)
    }
  }
}
