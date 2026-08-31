'use client'

/**
 * El detector de prueba de vida de AWS (Face Liveness), envuelto para:
 *  - configurar Amplify EN TIEMPO DE EJECUCIÓN con el Identity Pool que manda
 *    el core (sin variables de build), y
 *  - hablar español.
 *
 * Este archivo se importa SOLO con dynamic(..., { ssr: false }): el SDK de
 * Amplify no sobrevive el render en servidor.
 */
import { useEffect, useState } from 'react'
import { Amplify } from 'aws-amplify'
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness'
import '@aws-amplify/ui-react/styles.css'

type Props = {
  sessionId: string
  region: string
  identityPoolId: string
  onCompleta: () => void
  onError: (mensaje: string) => void
}

let configurado = false

export default function DetectorDeVida({ sessionId, region, identityPoolId, onCompleta, onError }: Props) {
  const [listo, setListo] = useState(false)

  useEffect(() => {
    if (!configurado) {
      Amplify.configure({
        Auth: { Cognito: { identityPoolId, allowGuestAccess: true } },
      })
      configurado = true
    }
    setListo(true)
  }, [identityPoolId])

  if (!listo) return <p className="p-4 text-center">Preparando la prueba de vida…</p>

  /* Los letreros del detector vienen enormes y en negro plano; se afinan a la
     identidad de Credion sin tocar la mecánica del componente. */
  const estilos = `
    .detector-credion .amplify-liveness-hint,
    .detector-credion .amplify-liveness-toast {
      font-size: 15px !important;
      font-weight: 600;
      line-height: 1.35;
      padding: 8px 14px !important;
      border-radius: 10px !important;
      background: rgba(14, 23, 33, 0.82) !important;
      backdrop-filter: blur(2px);
      max-width: 88%;
    }
    .detector-credion .amplify-liveness-toast__message { font-size: 15px !important; }
    .detector-credion .amplify-alert {
      border-radius: 10px !important;
      font-size: 14px !important;
    }
    .detector-credion .amplify-button--primary {
      background: #0E7269 !important;
      border-radius: 10px !important;
      font-weight: 600;
      padding: 12px 18px;
    }
    .detector-credion .amplify-button--primary:hover { background: #0a5b54 !important; }
    .detector-credion .amplify-liveness-camera-module { border-radius: 14px; overflow: hidden; }
  `

  return (
    <div className="detector-credion">
      <style>{estilos}</style>
      <FaceLivenessDetector
      sessionId={sessionId}
      region={region}
      onAnalysisComplete={async () => onCompleta()}
      onError={(e) => onError(e?.error?.message || 'La prueba de vida se interrumpió. Intenta de nuevo.')}
      displayText={{
        startScreenBeginCheckText: 'Comenzar la prueba',
        photosensitivityWarningHeadingText: 'Advertencia de fotosensibilidad',
        photosensitivityWarningBodyText:
          'Esta prueba muestra luces de colores. Ten cuidado si eres fotosensible.',
        photosensitivityWarningInfoText: 'Verificaremos que eres una persona real frente a la cámara.',
        goodFitCaptionText: 'Perfecto, quédate así',
        tooFarCaptionText: 'Acércate un poco',
        hintCenterFaceText: 'Centra tu cara en el óvalo',
        hintMoveFaceFrontOfCameraText: 'Pon tu cara frente a la cámara',
        hintTooManyFacesText: 'Debe verse una sola cara',
        hintCanNotIdentifyText: 'No se identifica una cara',
        hintTooCloseText: 'Aléjate un poco',
        hintTooFarText: 'Acércate un poco',
        hintConnectingText: 'Conectando…',
        hintVerifyingText: 'Verificando…',
        hintCheckCompleteText: 'Prueba completa',
        hintIlluminationTooBrightText: 'Busca un lugar con menos luz directa',
        hintIlluminationTooDarkText: 'Busca un lugar con más luz',
        hintHoldFaceForFreshnessText: 'Quédate quieto un momento',
        cameraNotFoundHeadingText: 'No se encontró la cámara',
        cameraNotFoundMessageText: 'Permite el acceso a la cámara o abre el enlace desde tu celular.',
        retryCameraPermissionsText: 'Reintentar',
        waitingCameraPermissionText: 'Esperando el permiso de la cámara…',
      }}
      />
    </div>
  )
}
