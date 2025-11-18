export const GrainBackground = () => {
  return (
    <div
      style={{
        opacity: 0.012,
        backgroundSize: '128px',
        backgroundRepeat: 'repeat',
        backgroundImage: 'url(/assets/images/grain.png)',
        zIndex: 999,
      }}
      className="fixed inset-0 w-full h-full pointer-events-none"
    />
  )
}
